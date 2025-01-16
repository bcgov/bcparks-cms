import React from "react"
import "../../styles/advisories/advisoryLegend.scss"
import redAlertIcon from "../../images/park/red-alert.svg"
import yellowAlertIcon from "../../images/park/yellow-alert.svg"
import blueAlertIcon from "../../images/park/blue-alert.svg"

const AdvisoryLegend = () => {
  const legendItems = [
    {
      label: "High",
      description: "Immediate danger and closures",
      icon: redAlertIcon,
    },
    {
      label: "Medium",
      description: "Safety and health related",
      icon: yellowAlertIcon,
    },
    {
      label: "Low",
      description: "Discretion and warnings",
      icon: blueAlertIcon,
    },
  ]

  return (
    <div className="advisory-legend">
      <div className="row g-0">
        {legendItems.map((legendItem, index) => {
          return (
            <div key={index} className="col col-12 col-md-4">
              <div className="advisory-legend-item">
                <div className="d-flex align-items-center me-3">
                  <img
                    src={legendItem.icon}
                    alt=""
                    className="advisory-status-icon"
                  />
                </div>
                <div>
                  <strong>
                    {legendItem.label}
                  </strong>
                  <p className="mb-0">
                    {legendItem.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mb-4 mt-3 px-md-5 mx-md-5 text-center">
        Advisories are updated Monday to Friday 8:30am to 4:30pm, excluding statutory holidays.<br />
        Get up-to-date provincial emergency information for wildfires, floods, and highways from:<br />
        <a href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status">
          BC Wildfire Service
        </a>{", "}
        <a href="https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/drought-flooding-dikes-dams/river-forecast-centre">
          BC River Forecast Centre
        </a>{", "}
        <a href="https://drivebc.ca">Drive BC</a>
      </div>
    </div>
  )
}

export default AdvisoryLegend
