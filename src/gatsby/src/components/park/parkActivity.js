import React, { useState, useEffect, useCallback } from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Accordion from "react-bootstrap/Accordion"
import Container from "react-bootstrap/Container"
import { Link } from "@mui/material"

import Heading from "./heading"
import HtmlContent from "./htmlContent"
import StaticIcon from "./staticIcon"
import Spacer from "./spacer"

import { isNullOrWhiteSpace } from "../../utils/helpers"
import "../../styles/cmsSnippets/parkInfoPage.scss"

export const AccordionList = ({ eventKey, activity, open }) => {
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    setIsShow(open)
  }, [open])

  return (
    <Accordion
      className="park-details mb-2"
      activeKey={isShow ? eventKey : ''}
    >
      <Accordion.Toggle
        as={Container}
        aria-controls={activity.activityType.activityName}
        eventKey={eventKey}
        onClick={() => setIsShow(!isShow)}
      >
        <div
          id={activity.activityType.activityCode}
          className="d-flex justify-content-between p-3 accordion-toggle"
        >
          <div className="d-flex justify-content-left align-items-center pl-2">
            <StaticIcon name={activity.activityType.icon} size={48} />
            <HtmlContent className="pl-3 accordion-header">
              {activity.activityType.activityName}
            </HtmlContent>
          </div>
          <div className="d-flex align-items-center expand-icon">
            <i
              className={
                (isShow ? "open " : "close ") +
                "fa fa-angle-down mx-3"
              }
            ></i>
          </div>
        </div>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={eventKey}>
        <div className="p-4">
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

export default function ParkActivity({ data }) {
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

  if (activityData.length === 0) return null

  return (
    <div>
      <Row id="park-activity-container" className="anchor-link">
        <Col>
          <Heading>Activities</Heading>
        </Col>
      </Row>
      <Row>
        <Col>
          <Link
            role="link"
            tabIndex="0"
            underline="hover"
            onClick={() => setOpen(!open)}
            className="expand-link"
          >
            {open ? (<>
              Collapse all<i className="fa fa-angle-up"></i>
            </>) : (<>
              Expand all<i className="fa fa-angle-down"></i>
            </>)}
          </Link>
          <div>
            {activityData.map((activity, index) => (
              <AccordionList
                key={index}
                eventKey={index.toString()}
                activity={activity}
                open={open}
              />
            ))}
          </div>
        </Col>
      </Row>
      <Spacer />
    </div>
  )
}
