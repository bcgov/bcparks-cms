import React, { useState, useEffect, useCallback } from "react"
import Accordion from "react-bootstrap/Accordion"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons"

import HtmlContent from "./htmlContent"
import StaticIcon from "./staticIcon"
import DiscoverParksLogo from "../../images/discover-parks-instagram-dark-green-icon-with-text.png"
import { isNullOrWhiteSpace } from "../../utils/helpers"
import "../../styles/cmsSnippets/parkInfoPage.scss"

export const AccordionList = ({ eventKey, activity, open, toggleAccordion }) => {
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    setIsShow(open)
  }, [open])

  return (
    <Accordion
      activeKey={isShow ? eventKey : ''}
      className={`is-open--${isShow}`}
    >
      <Accordion.Toggle
        as={"div"}
        aria-controls={activity.activityType.activityName}
        eventKey={eventKey}
        onClick={() => {
          setIsShow(!isShow)
          toggleAccordion(eventKey)
        }}
      >
        <div
          id={activity.activityType.activityCode}
          className="d-flex justify-content-between accordion-toggle"
        >
          <div className="d-flex align-items-center">
            <StaticIcon name={activity.activityType.icon} size={36} />
            <HtmlContent className="accordion-header">
              {activity.activityType.activityName}
            </HtmlContent>
          </div>
          <div className="d-flex align-items-center">
            {isShow ?
              <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />
            }
          </div>
        </div>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={eventKey}>
        <div className="accordion-content">
          <HtmlContent>
            {!isNullOrWhiteSpace(activity.description.data) ?
              activity.description.data : activity.activityType.defaultDescription.data
            }
          </HtmlContent>
          {!activity.hideStandardCallout &&
            !isNullOrWhiteSpace(activity.activityType.appendStandardCalloutText.data) && (
              <blockquote className="callout-box">
                <HtmlContent>
                  {activity.activityType.appendStandardCalloutText.data}
                </HtmlContent>
              </blockquote>
            )}
        </div>
      </Accordion.Collapse>
    </Accordion>
  )
}

export default function ParkActivity({ data, slug, hasDiscoverParksLink }) {
  const [activityData] = useState(
    JSON.parse(JSON.stringify(data)) // deep copy
  )
  const [expanded, setExpanded] = useState(Array(data.length).fill(false))
  const [hash, setHash] = useState("")
  const [open, setOpen] = useState(false)

  const toggleExpand = useCallback(
    index => {
      expanded[index] = !expanded[index]
      setExpanded([...expanded])
    },
    [expanded]
  )
  const toggleAccordion = (index) => {
    setExpanded(prevStates => {
      const newStates = [...prevStates]
      newStates[index] = !newStates[index]
      return newStates
    })
  }

  const checkHash = useCallback(() => {
    // Check hash in url
    // if we find a matching activityCode, open that activity accordion
    let h = ""
    let idx = 0
    if (typeof window !== "undefined") {
      h = window.location.hash
      if (h !== undefined && h !== hash) {
        activityData.forEach(activity => {
          if (h === "#" + activity.activityType.activityCode) {
            if (!expanded[idx]) {
              toggleExpand(idx)
            }
          }
          idx++
        })
        setHash(h)
      }
    }
  }, [expanded, activityData, hash, toggleExpand])

  useEffect(() => {
    window.addEventListener("hashchange", function (e) {
      checkHash()
    })
    checkHash()
  }, [activityData, checkHash])

  useEffect(() => {
    setOpen(expanded.every(state => state))
  }, [expanded])

  useEffect(() => {
    if (activityData.length === 1) {
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityData.length])

  if (activityData.length === 0) return null

  return (
    <div id="things-to-do" className="anchor-link">
      {/* id="park-activity-container" should be removed once it's removed from the contents */}
      <h2 id="park-activity-container" className="section-heading">
        Things to do
      </h2>
      <Row>
        <Col>
          {activityData.length > 1 && (
            <button
              onClick={() => setOpen(!open)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpen(!open)
                }
              }}
              className="btn btn-link expand-link expand-icon"
            >
              {open ?
                <>Collapse all <FontAwesomeIcon icon={faChevronUp} /></>
                :
                <>Expand all <FontAwesomeIcon icon={faChevronDown} /></>
              }
            </button>
          )}
          {activityData.map((activity, index) => (
            <AccordionList
              key={index}
              eventKey={index.toString()}
              activity={activity}
              open={open}
              toggleAccordion={toggleAccordion}
            />
          ))}
        </Col>
      </Row>
      {hasDiscoverParksLink && (
        <Row className="discpver-parks mt-3">
          <Col className="discpver-parks__col">
            <div className="discpver-parks__col--left">
              <img
                src={DiscoverParksLogo}
                alt="Discover Parks Logo"
                className="discover-parks-logo"
              />
            </div>
            <div>
              For more events and activities happening at this park,
              visit <a href={`https://www.discoverparks.ca/parks/${slug}`}>
                discoverparks.ca</a>. Discover Parks is developed
              by <a href="https://bcparksfoundation.ca">
                BC Parks Foundation</a>, our official charitable partner.
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}
