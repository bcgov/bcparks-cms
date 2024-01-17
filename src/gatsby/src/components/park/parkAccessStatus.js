import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { graphql, useStaticQuery, Link } from "gatsby"
import { format } from "date-fns"

import blueStatusIcon from "../../images/park/blue-status-64.png"
import redStatusIcon from "../../images/park/red-status-64.png"
import yellowStatusIcon from "../../images/park/yellow-status-64.png"


const ICONS = {
  blue: blueStatusIcon,
  yellow: yellowStatusIcon,
  red: redStatusIcon,
}

const thisYear = new Date().getFullYear();
const today = format(new Date(), "yyyy-MM-dd");

function checkParkClosure(operatingDates) {
  if (!operatingDates) {
    return false;
  }
  const dates = operatingDates.filter(d => d.operatingYear === thisYear);
  for (const d of dates) {
    if (d.gateOpenDate && d.gateOpenDate > today) {
      return true;
    }
    if (d.gateCloseDate && d.gateCloseDate < today) {
      return true;
    }
  }
  return false;
}

function checkSubAreaClosure(subAreas, staticData) {
  if (!subAreas) {
    return false;
  }
  const subAreaTypeList = staticData?.allStrapiParkOperationSubAreaType.nodes
  for (const subArea of subAreas) {
    // standardize date from graphQL with date from elasticSearch
    if (subArea.parkSubAreaType) {
      if (subArea.closureAffectsAccessStatus === null) {
        subArea.closureAffectsAccessStatus = subArea.parkSubAreaType.closureAffectsAccessStatus;
      }
    } else if (subArea.subAreaTypeId) {
      let subAreaType = subAreaTypeList.find(type => {
        return type.strapi_id === subArea.subAreaTypeId
      });
      subArea.closureAffectsAccessStatus = subArea.isIgnored === null
        ? subAreaType.closureAffectsAccessStatus
        : !subArea.isIgnored;
    }
    // skip ignored subareas
    if (!subArea.closureAffectsAccessStatus) {
      break;
    }
    if (subArea.isActive !== true || subArea.isOpen !== true) {
      break;
    }
    // check the dates to see if any subareas are closed
    const dates = subArea.parkOperationSubAreaDates.filter(d =>
      d.operatingYear === thisYear &&
      d.isActive === true
    );
    for (const d of dates) {
      if (d.openDate && d.openDate > today) {
        return true;
      }
      if (d.closeDate && d.closeDate < today) {
        return true;
      }
    }
  }
  return false;
}

function parkAccessFromAdvisories(advisories, mainGateClosure, areaClosure, staticData) {

  let accessStatuses = []
  const accessStatusList = staticData?.allStrapiAccessStatus.nodes

  let parkStatusIcon = blueStatusIcon
  let parkStatusText = "Open"
  let parkStatusColor = "blue"

  for (let advisory of advisories) {
    if (advisory.accessStatus) {
      // data is coming from /api/public-advisories/items and already includes the accessStatus
      accessStatuses.push({
        precedence: advisory.accessStatus.precedence,
        color: advisory.accessStatus.color,
        text: advisory.accessStatus.groupLabel,
      })
    } else {
      let accessStatus = accessStatusList.find(status => {
        return status.strapi_id === advisory.accessStatusId
      })
      if (!accessStatus) {
        break
      } else {
        accessStatuses.push({
          precedence: accessStatus.precedence,
          color: accessStatus.color,
          text: accessStatus.groupLabel,
        })
      }
    }
  }

  accessStatuses.sort((a, b) => {
    return a.precedence - b.precedence
  })

  if (
    accessStatuses.length > 0 &&
    typeof ICONS[accessStatuses[0].color] !== "undefined"
  ) {
    parkStatusIcon = ICONS[accessStatuses[0].color]
    parkStatusText = accessStatuses[0].text
    parkStatusColor = accessStatuses[0].color
  }

  if (parkStatusText === "Open" && (mainGateClosure || areaClosure)) {
    parkStatusText = "Seasonal restrictions";
  }

  return {
    parkStatusIcon: parkStatusIcon,
    parkStatusText: parkStatusText,
    parkStatusColor: parkStatusColor,
    mainGateClosure: mainGateClosure,
    areaClosure: areaClosure
  }
}

export default function ParkAccessStatus({ advisories, slug, subAreas, operationDates, onStatusCalculated, punctuation }) {

  const staticData = useStaticQuery(
    graphql`
      {
        allStrapiAccessStatus {
          nodes {
            id
            strapi_id
            color
            accessStatus
            groupLabel
            precedence
          }
        }
        allStrapiParkOperationSubAreaType {
          nodes {
            strapi_id
            closureAffectsAccessStatus
          }
        }
      }
    `
  )

  const [accessStatus, setAccessStatus] = useState(null)

  useEffect(() => {
    const mainGateClosure = checkParkClosure(operationDates);
    const areaClosure = checkSubAreaClosure(subAreas, staticData);
    const status = parkAccessFromAdvisories(advisories, mainGateClosure, areaClosure, staticData);
    setAccessStatus(status)
    if (onStatusCalculated !== undefined) {
      // return the accessStatus to the parent component if a function prop was passed in
      onStatusCalculated(status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationDates, subAreas, advisories]);

  return (
    <div className="access-status-icon">
      {accessStatus && (<>
        {accessStatus.parkStatusText === "Open" ? (
          <>
            <img src={accessStatus.parkStatusIcon} alt="" className="mr-2" />
            {accessStatus.parkStatusText}{punctuation}
          </>
        ) : (
          <>
            <img src={accessStatus.parkStatusIcon} alt="" className="mr-2" />
            {accessStatus.parkStatusText}{", "}
            <Link to={`/${slug}/#park-advisory-details-container`}>
              check advisories
            </Link>{punctuation}
          </>
        )}
      </>)}
    </div>

  )
}

ParkAccessStatus.propTypes = {
  advisories: PropTypes.array.isRequired,
  slug: PropTypes.string.isRequired,
  subAreas: PropTypes.array.isRequired,
  operationDates: PropTypes.array.isRequired,
  onStatusCalculated: PropTypes.func,
  punctuation: PropTypes.string
}
