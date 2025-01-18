import React, { useState } from "react"
import { Link } from "gatsby"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Badge from "react-bootstrap/Badge"
import { parseJSON, format } from "date-fns"

import HtmlContent from "../htmlContent"
import AdvisoryDate from "./advisoryDate"
import redAlertIcon from "../../images/park/red-alert.svg"
import yellowAlertIcon from "../../images/park/yellow-alert.svg"
import blueAlertIcon from "../../images/park/blue-alert.svg"

import "../../styles/advisories/advisoryCard.scss"

const formatDate = isoDate => {
  return isoDate ? format(parseJSON(isoDate), "MMMM d, yyyy") : ""
}

const AdvisoryCard = ({ advisory, parkInfoHash }) => {
  const [open, setOpen] = useState(false)
  const checkRelation = (orcs, orcsSite) => {
    return orcsSite?.includes(orcs?.toString())
  }

  // Displayed dates
  const advisoryDate = formatDate(advisory.advisoryDate)
  const updatedDate = formatDate(advisory.updatedDate)
  const effectiveDate = formatDate(advisory.effectiveDate)
  const endDate = formatDate(advisory.endDate)
  const hasAdvisoryDateDisplay = advisory.isAdvisoryDateDisplayed && advisoryDate
  const hasUpdatedDateDisplay = advisory.isUpdatedDateDisplayed && updatedDate
  const hasEffectiveDateDisplay = advisory.isEffectiveDateDisplayed && effectiveDate
  const hasEndDateDisplay = advisory.isEndDateDisplayed && endDate
  const hasEffectiveDateRange = effectiveDate !== endDate
  const hasDisplayedDate = 
    advisory.isAdvisoryDateDisplayed ||  advisory.isUpdatedDateDisplayed || 
    advisory.isEffectiveDateDisplayed || advisory.isEndDateDisplayed

  const showFireCentres = advisory.fireCentres?.length > 0;
  const showFireZones = advisory.fireZones?.length > 0;
  const showRegions = advisory.regions?.length > 0;
  const showSections = advisory.sections?.length > 0;
  const showNaturalResourceDistricts = advisory.naturalResourceDistricts?.length > 0;

  const checkAdditionalParks = () => {

    const advisoryFireCentres = advisory.fireCentres.map(c => { return c.id })
    const advisoryFireZones = advisory.fireZones.map(z => { return z.id })
    const advisoryRegions = advisory.regions.map(r => { return r.id })
    const advisorySections = advisory.sections.map(s => { return s.id })
    const advisoryNaturalResourceDistricts = advisory.naturalResourceDistricts.map(n => { return n.id })

    const parkCameFromFireCentre = (paKey) => {
      const parkFireCentres = parkInfoHash[paKey]?.fireCentres || [];
      return parkFireCentres.some(x => advisoryFireCentres.includes(x))
    }

    const parkCameFromFireZone = (paKey) => {
      const parkFireZones = parkInfoHash[paKey]?.fireZones || [];
      return parkFireZones.some(x => advisoryFireZones.includes(x))
    }

    const parkCameFromRegion = (paKey) => {
      const parkRegions = parkInfoHash[paKey]?.regions || [];
      return parkRegions.some(x => advisoryRegions.includes(x))
    }

    const parkCameFromSection = (paKey) => {
      const parkSections = parkInfoHash[paKey]?.sections || [];
      return parkSections.some(x => advisorySections.includes(x))
    }

    const parkCameFromNaturalResourceDistrict = (paKey) => {
      const parkNaturalResourceDistricts = parkInfoHash[paKey]?.naturalResourceDistricts || [];
      return parkNaturalResourceDistricts.some(x => advisoryNaturalResourceDistricts.includes(x))
    }

    for (const pa of advisory.protectedAreas) {
      const paKey = pa.id.toString();
      if (showFireCentres && !parkCameFromFireCentre(paKey)) {
        return true;
      }
      if (showFireZones && !parkCameFromFireZone(paKey)) {
        return true;
      }
      if (showRegions && !parkCameFromRegion(paKey)) {
        return true;
      }
      if (showSections && !parkCameFromSection(paKey)) {
        return true;
      }
      if (showNaturalResourceDistricts && !parkCameFromNaturalResourceDistrict(paKey)) {
        return true;
      }
    }

    return false;
  }

  const hasAdditionalParks = checkAdditionalParks();

  // Combine all the arrays into a single array
  const combinedArray = [
    ...(showFireCentres ? advisory.fireCentres.map(item => ({ ...item, type: 'fireCentre', name: item.fireCentreName })) : []),
    ...(showFireZones ? advisory.fireZones.map(item => ({ ...item, type: 'fireZone', name: item.fireZoneName })) : []),
    ...(showRegions ? advisory.regions.map(item => ({ ...item, type: 'region', name: item.regionName })) : []),
    ...(showSections ? advisory.sections.map(item => ({ ...item, type: 'section', name: item.sectionName })) : []),
    ...(showNaturalResourceDistricts ? advisory.naturalResourceDistricts.map(item => ({ ...item, type: 'naturalResourceDistrict', name: item.naturalResourceDistrictName })) : [])
  ];
  // Sort the combined array alphabetically by name
  combinedArray.sort((a, b) => a.name.localeCompare(b.name));

  const icons = [
    { alert: "redAlert", icon: redAlertIcon },
    { alert: "yellowAlert", icon: yellowAlertIcon },
    { alert: "blueAlert", icon: blueAlertIcon }
  ]

  return (
    <Row
      key={advisory.id}
      tabIndex="-1"
      className="advisory-card g-0"
    >
      <Col xs="auto" className="advisory-card--left">
        {/* advisory status icon */}
        <img
          src={icons.find(icon => icon.alert === advisory.alertClass).icon}
          alt={advisory.alertMsg}
          className="icon"
        />
      </Col>
      <Col className="advisory-card--right">
        {/* advisory title */}
        {advisory.title && <h3 className="title">{advisory.title}</h3>}
        {/* advisory content */}
        <div className="card-content">
          <div className="d-flex flex-wrap">
            {combinedArray.map((item, index) => (
              <Badge
                pill
                key={index}
                className="park-link badge rounded-pill badge-primary"
              >
                {item.name}
                {item.type === "region" ? " Region" : item.type === "section" ? " Section" : ""}
              </Badge>
            ))}
            {hasAdditionalParks &&
              <p className="d-inline-flex">and more parks</p>
            }
          </div>
          {advisory.protectedAreas.length > 5 ? (
            <div className="d-flex flex-wrap">
              {open && (
                advisory.protectedAreas
                  .filter(park => park.publishedAt && park.isDisplayed)
                  .map((par, index) => (
                    <Link
                      className="park-link badge rounded-pill badge-light"
                      to={`/${par.slug}`}
                      key={index}
                    >
                      {par.protectedAreaName}
                    </Link>
                  ))
              )}
              <button
                className="btn btn-link"
                aria-label={open
                  ? `Hide parks affected`
                  : `Show all ${advisory.protectedAreas.length} parks affected`
                }
                onClick={() => setOpen(!open)}
              >
                {open
                  ? `Hide parks affected`
                  : `Show all ${advisory.protectedAreas.length} parks affected`
                }
              </button>
            </div>
          ) : (
            <div className="d-flex flex-wrap">
              {advisory.protectedAreas.length > 0 &&
                advisory.protectedAreas
                  .filter(park => park.publishedAt && park.isDisplayed)
                  .map((par, index) => (
                    <Link
                      className="park-link badge rounded-pill badge-light"
                      to={`/${par.slug}`}
                      key={index}
                    >
                      {par.protectedAreaName}
                    </Link>
                  ))
              }
              {advisory.sites.length > 0 &&
                advisory.sites
                  .filter(site => site.publishedAt && site.isDisplayed)
                  .map((site, index) => (
                    advisory.protectedAreas.map((park, index) => (
                      checkRelation(park.orcs, site.orcsSiteNumber) &&
                      <Link
                        className="park-link badge rounded-pill badge-light"
                        to={`/${park.slug}/${site.slug}`}
                        key={index}
                      >
                        {park.protectedAreaName} – {site.siteName}
                      </Link>
                    ))
                  ))
              }
            </div>
          )}
          {/* advisory description */}
          {advisory.description &&
            <HtmlContent>{advisory.description}</HtmlContent>
          }
          {/* advisory links */}
          {advisory.links?.map(({ title, url, id }) => (
            <a
              href={url}
              style={{ display: 'block' }}
              target="_blank"
              rel="noopener noreferrer"
              key={id}
            >
              {title}
            </a>
          ))}
          <div className="card-content--bottom">
            {/* advisory date */}
            <AdvisoryDate
              hasEffectiveDateDisplay={hasEffectiveDateDisplay}
              hasEndDateDisplay={hasEndDateDisplay}
              effectiveDate={effectiveDate}
              hasEffectiveDateRange={hasEffectiveDateRange}
              endDate={endDate}
              hasAdvisoryDateDisplay={hasAdvisoryDateDisplay}
              advisoryDate={advisoryDate}
              hasUpdatedDateDisplay={hasUpdatedDateDisplay}
              updatedDate={updatedDate}
              hasDisplayedDate={hasDisplayedDate}
            />
            {/* advisory type */}
            <div className="type">
              <small>Advisory type</small>
              <small><b>{advisory.eventType.eventType}</b></small>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default AdvisoryCard
