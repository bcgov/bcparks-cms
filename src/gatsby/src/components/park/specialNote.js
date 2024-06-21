import React from "react"
import HtmlContent from "./htmlContent"

export default function SpecialNote({ specialNotes }) {
  return (
    <div id="park-special-notes-container" className="mb-4">
      <h3>Special notes</h3>
      <HtmlContent>{specialNotes}</HtmlContent>
    </div>
  )
}
