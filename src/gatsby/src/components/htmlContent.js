import React from "react"
import { usePreRenderVideo } from "../utils/usePreRenderVideo"

export default function HtmlContent(props) {
  const { htmlContent } = usePreRenderVideo(props.children)
  if (!props) return null
  return (
    <div
      lang="en"
      aria-hidden={props.ariaHidden}
      className={`raw-html-content ${props.className ? props.className : ""}`}
      dangerouslySetInnerHTML={{ __html: htmlContent || props.children }}
    />
  )
}
