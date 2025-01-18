import React from "react"

export default function CustomToggle({
  eventKey,
  toggleId,
  ariaLabel,
  ariaControls,
  handleClick,
  children,
}) {
  const handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick(eventKey)
    }
  }

  return (
    <div
      id={toggleId}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      onClick={() => handleClick(eventKey)}
      onKeyDown={handleKeyDown}
      className="d-flex justify-content-between accordion-toggle"
    >
      {children}
    </div>
  )
}
