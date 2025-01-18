import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import HtmlContent from "../htmlContent"
import * as cheerio from 'cheerio';

export default function ParkOverview({ data: parkOverview, type }) {
  const [expanded, setExpanded] = useState(false)
  const [height, setHeight] = useState(0)
  const [sectionHeight, setSectionHeight] = useState(0)
  const ref = useRef(null)
  const isLong = height >= 300
  const isMedium = height > 260 && height < 300

  const $ = cheerio.load(parkOverview);
  $('a').attr('tabindex', '-1')
  const collapsedParkOverview = $.html()
  const hasHr = $('hr').length > 0
  const hrAtEnd = parkOverview.trim().endsWith('<hr>')
  const hasExpandCondition = (hasHr || isLong) && !isMedium && !hrAtEnd

  useEffect(() => {
    if (!hasHr && ref.current.clientHeight > 260) {
      setHeight(ref.current.clientHeight)
    }
  }, [hasHr, expanded])

  useEffect(() => {
    const h2 = document.querySelector('h2.section-heading');
    const hr = document.querySelector('hr');
    // height from the <h2> to the <hr>
    const height = hr?.getBoundingClientRect().top - h2.getBoundingClientRect().top;
    setSectionHeight(height)
  }, [])

  return (
    <div id="highlights" className="anchor-link">
      <div
        ref={ref}
        className={`expandable-description ${expanded ? "expanded" : "collapsed"} ${hasExpandCondition && "gradient"}`}
        style={{ maxHeight: expanded ? "none" : `${hasHr ? sectionHeight : (isLong ? 260 : 300)}px` }}
      >
        {/* id="park-overview-container" should be removed once it's removed from the contents */}
        <h2 id="park-overview-container" className="section-heading">
          Highlights in this {type}
        </h2>
        <HtmlContent ariaHidden={!expanded} className="park-overview-html">
          {expanded ? parkOverview : collapsedParkOverview}
        </HtmlContent>
      </div>
      {hasExpandCondition &&
        <button
          className="btn btn-link park-overview-link expand-icon"
          aria-expanded={expanded} 
          aria-label={expanded ? "Show fewer highlights" : "Show more highlights"}
          onClick={() => {
            setExpanded(!expanded)
          }}
        >
          {expanded ?
            <>Show less <FontAwesomeIcon icon={faChevronUp} /></>
            :
            <>Show more <FontAwesomeIcon icon={faChevronDown} /></>
          }
        </button>
      }
    </div>
  );
}
