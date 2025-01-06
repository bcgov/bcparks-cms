import React, { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleUp } from "@fortawesome/free-solid-svg-icons"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  const handleClick = () => {
    window[`scrollTo`]({ top: 0, behavior: `smooth` })
    document.getElementById('gatsby-focus-wrapper').focus()
  }

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return (
    isVisible && (
      <button
        aria-label="Scroll to top"
        onClick={handleClick}
        className="btn-scroll"
      >
        <div className="btn-scroll--inner">
          <FontAwesomeIcon icon={faAngleUp} />
        </div>
      </button>
    )
  );
}
