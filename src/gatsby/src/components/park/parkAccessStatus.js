import React from "react"
import PropTypes from "prop-types"
import { graphql, useStaticQuery, Link } from "gatsby"

import blueStatusIcon from "../../images/park/blue-status-64.png"
import redStatusIcon from "../../images/park/red-status-64.png"
import yellowStatusIcon from "../../images/park/yellow-status-64.png"


const ICONS = {
  blue: blueStatusIcon,
  yellow: yellowStatusIcon,
  red: redStatusIcon,
}

function ParkAccessFromAdvisories(advisories) {
  const data = useStaticQuery(
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
      }
    `
  )

  let accessStatuses = []
  const accessStatusList = data?.allStrapiAccessStatus.nodes

  let parkStatusIcon = blueStatusIcon
  let parkStatusText = "Open"
  let parkStatusColor = "blue"

  for (let advisory of advisories) {
    if (advisory.accessStatus?.precedence) {
      // advisory is coming from parks details page
      accessStatuses.push({
        precedence: advisory.accessStatus.precedence,
        color: advisory.accessStatus.color,
        text: advisory.accessStatus.groupLabel,
      })
    }
    if (advisory.accessStatusId) {
      // advisory is coming from find-a-park
      // get accessStatus based on accessStatusId
      let thisStatus = accessStatusList.find(status => {
        return status.strapi_id === advisory.accessStatusId
      })
      if (!thisStatus) {
        break
      } else {
        accessStatuses.push({
          precedence: thisStatus.precedence,
          color: thisStatus.color,
          text: thisStatus.groupLabel,
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

  return {
    parkStatusIcon: parkStatusIcon,
    parkStatusText: parkStatusText,
    parkStatusColor: parkStatusColor,
  }
}
export { ParkAccessFromAdvisories }

export default function ParkAccessStatus({ advisories, slug }) {
  const {
    parkStatusIcon,
    parkStatusText,
  } = ParkAccessFromAdvisories(advisories)

  // unfortunately, incoming advisories from parks details and explore pages are structured differently.
  // we need to differentiate between the two structures.

  return (
    <div className="park-access-status">
      {parkStatusText === "Open" ? (
        <>
          <img src={parkStatusIcon} alt="" class="mr-1" /> {parkStatusText}
        </>
      ) : (
          <Link to={`/${slug}/#park-advisory-details-container`}>
            <>
              <img src={parkStatusIcon} alt="" class="mr-1" /> {parkStatusText}
            </>
        </Link>
      )}
    </div>
  )
}

ParkAccessStatus.propTypes = {
  advisories: PropTypes.array,
}
