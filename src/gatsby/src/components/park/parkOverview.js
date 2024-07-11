import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import HtmlContent from "./htmlContent"
import * as cheerio from 'cheerio';

const PREFIX = 'park-overview';

const classes = {
  collapsed: `${PREFIX} collapsed`,
  expanded: `${PREFIX} expanded`
};

export default function ParkOverview({ data: parkOverview, type }) {
  const [expanded, setExpanded] = useState(false)
  const [height, setHeight] = useState(0)
  const [sectionHeight, setSectionHeight] = useState(0)
  const ref = useRef(null)
  const isLong = height > 259

  const $ = cheerio.load(parkOverview);
  $('a').attr('tabindex', '-1')
  const collapsedParkOverview = $.html()
  const hasHr = $('hr').length > 0

  useEffect(() => {
    setHeight(ref.current.clientHeight)
  }, [expanded])

  useEffect(() => {
    const h2 = document.querySelector('h2.section-heading');
    const hr = document.querySelector('hr');
    // height from the <h2> to the <hr>
    const height = hr?.getBoundingClientRect().top - h2.getBoundingClientRect().top;
    setSectionHeight(height)
  }, [])

  return (
    <div id="park-highlights-container" className="anchor-link">
      <div
        ref={ref}
        className={expanded ? classes.expanded : classes.collapsed}
        style={{ maxHeight: expanded ? "none" : `${hasHr ? sectionHeight : 260}px` }}
      >
        {/* id="park-overview-container" can be removed once it's no longer used */}
        <h2 id="park-overview-container" className="section-heading">
          Highlights in this {type}
        </h2>
        <HtmlContent className="park-overview-html">
          {expanded ? parkOverview : collapsedParkOverview}
        </HtmlContent>
      </div>
      {(hasHr || isLong) &&
        <button
          className="btn btn-link park-overview-link expand-icon"
          onClick={() => {
            setExpanded(!expanded)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setExpanded(!expanded)
            }
          }}
        >
          {expanded ?
            <>Show less highlights <FontAwesomeIcon icon={faChevronUp} /></>
            :
            <>Show more highlights <FontAwesomeIcon icon={faChevronDown} /></>
          }
        </button>
      }
    </div>
  );
}
