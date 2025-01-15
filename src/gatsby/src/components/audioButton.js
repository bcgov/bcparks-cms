import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons"
import "../styles/audioButton.scss"

export default function AudioButton({ audio }) {
  // refs and states
  const audioRef = useRef(null)
  const [trackSrc, setTrackSrc] = useState("")
  const [expanded, setExpanded] = useState(false)

  // functions
  const createVttContent = transcript => {
    return `WEBVTT\n\n1\n00:00:00.000 --> 00:00:10.000\n${transcript}`
  }
  const createBlobUrl = content => {
    const blob = new Blob([content], { type: "text/vtt" })
    return URL.createObjectURL(blob)
  }
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  // effects
  useEffect(() => {
    if (audio?.transcript.length) {
      const vttContent = createVttContent(audio.transcript)
      const url = createBlobUrl(vttContent)
      setTrackSrc(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [audio?.transcript])

  return (
    <div className="audio-container">
      <div className="audio-container--left">
        <button
          aria-label="Play park name audio"
          onClick={handlePlay}
          className="btn-audio"
        >
          <FontAwesomeIcon icon={faVolumeHigh} />
        </button>
        <audio ref={audioRef} src={audio.url}>
          <track kind="captions" srcLang="en" src={trackSrc} />
        </audio>
      </div>
      <div className="audio-container--right">
        <p>
          <b>{audio.title}</b>
        </p>
        <p>
          <small>
            Spoken in {audio.credit} pronounced by {audio.credit}
          </small>
        </p>
        {expanded && (
          <div className="mb-3">
            <p>
              <small>
                <b>Transcript</b>
              </small>
            </p>
            <small>{audio.transcript}</small>
          </div>
        )}
        {audio.transcript && (
          <button
            aria-label={expanded ? "Hide transcript" : "Show transcript"}
            onClick={() => setExpanded(!expanded)}
            className="btn btn-link expand-icon transcript-link"
          >
            {expanded ? (
              <>
                Hide transcript <FontAwesomeIcon icon={faChevronUp} />
              </>
            ) : (
              <>
                Show transcript <FontAwesomeIcon icon={faChevronDown} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
