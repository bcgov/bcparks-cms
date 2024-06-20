import React from "react"
import { Link } from "gatsby"

export default function VisitResponsibly({ campings, activities, marineProtectedArea }) {
  const campingFacilityCodes = ["frontcountry-camping", "group-camping"]
  const backcountryFacilityCodes = ["backcountry-camping", "wilderness-camping"]
  const marineFacilityCode = ["marine-accessible-camping"]
  const winterFacilityCode = ["winter-camping"]
  const winterActivityCode = ["winter-recreation"]
  const activityCodes = ["fishing", "hunting"]
  const hasCamping = campings.some(c => campingFacilityCodes.includes(c.facilityType?.facilityCode))
  const hasBackcountry = campings.some(c => backcountryFacilityCodes.includes(c.facilityType?.facilityCode))
  const hasMarineCamping = campings.some(c => marineFacilityCode.includes(c.facilityType?.facilityCode))
  const hasWinterCamping = campings.some(c => winterFacilityCode.includes(c.facilityType?.facilityCode))
  const hasWinterActivities = activities.some(a => winterActivityCode.includes(a.activityType?.activityCode))
  const hasFishingOrHunting = activities.some(a => activityCodes.includes(a.activityType?.activityCode))

  return (
    <>
      <h3>Visit responsibly</h3>
      <p>
        Follow these guides to ensure your activities are safe, respectful, and ecologically friendly:
      </p>
      <ul>
        <li>
          <Link to="/plan-your-trip/visit-responsibly/staying-safe">
            Staying safe
          </Link>
        </li>
        <li>
          <Link to="/plan-your-trip/visit-responsibly/responsible-recreation">
            Responsible recreation
          </Link>
        </li>
        <li>
          <Link to="/plan-your-trip/visit-responsibly/camping-day-use-guide">
            {hasCamping ?
              "Camping and day-use guide" : "Day-use guide"
            }
          </Link>
        </li>
        {hasBackcountry &&
          <li>
            <Link to="/plan-your-trip/visit-responsibly/backcountry-guide">
              Backcountry guide
            </Link>
          </li>
        }
        {(hasMarineCamping || marineProtectedArea === "Y") &&
          <li>
            <Link to="/plan-your-trip/visit-responsibly/marine-visitor-guide">
              Marine visitor guide
            </Link>
          </li>
        }
        <li>
          <Link to="/plan-your-trip/visit-responsibly/wildlife-safety">
            Wildlife safety
          </Link>
        </li>
        {(hasWinterCamping || hasWinterActivities) &&
          <li>
            <Link to="/plan-your-trip/visit-responsibly/winter-safety">
              Winter safety
            </Link>
          </li>
        }
        {hasFishingOrHunting &&
          <li>
            <Link to="/plan-your-trip/visit-responsibly/fishing-hunting-guide">
              Fishing and hunting guide
            </Link>
          </li>
        }
      </ul>
    </>
  )
}
