import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { sortBy, truncate } from "lodash"
import { graphql } from "gatsby"
import {
  Box,
  Container,
  Grid,
  CssBaseline,
  Link,
  Breadcrumbs,
} from "@material-ui/core"
import useScrollSpy from "react-use-scrollspy"

import Footer from "../components/footer"
import Header from "../components/header"
import PageMenu from "../components/pageContent/pageMenu"

import AccessibilityDetails from "../components/park/accessibilityDetails"
import AdvisoryDetails from "../components/park/advisoryDetails"
import Heading from "../components/park/heading.js"
import ParkActivity from "../components/park/parkActivity"
import ParkFacility from "../components/park/parkFacility"
import ParkHeader from "../components/park/parkHeader"
import ParkOverview from "../components/park/parkOverview"
import ParkPhotoGallery from "../components/park/parkPhotoGallery"
import MapLocation from "../components/park/mapLocation"
import ScrollToTop from "../components/scrollToTop"
import Seo from "../components/seo"

import "../styles/parks.scss"
import { useStyles } from "../utils/constants"

const loadAdvisories = async (apiBaseUrl, orcs) => {
  const params = {
    "protectedAreas.orcs_in": orcs,
    _limit: 100,
    _sort: "urgency.sequence:DESC",
  }

  return axios.get(`${apiBaseUrl}/public-advisories`, { params })
}

export default function ParkTemplate({ data }) {
  const classes = useStyles()

  const apiBaseUrl = data.site.siteMetadata.apiURL

  const site = data.strapiSites
  const park = site.protectedArea
  const activities = site.parkActivities
  const facilities = site.parkFacilities
  const operations = site.parkOperation || {}
  const photos = [...data.featuredPhotos.nodes, ...data.regularPhotos.nodes]

  const activeActivities = sortBy(
    activities.filter(
      activity => activity.isActive && activity.activityType.isActive
    ),
    ["activityType.rank", "activityType.activityName"],
    ["asc"]
  )
  const activeFacilities = sortBy(
    facilities.filter(
      facility => facility.isActive && facility.facilityType.isActive
    ),
    ["facilityType.rank", "facilityType.facilityName"],
    ["asc"]
  )

  const hasReservations = operations.hasReservations
  const hasDayUsePass = site.hasDayUsePass

  // Use hasCamping if camping section is needed
  // const hasCamping = activeFacilities.some(facility =>
  //   facility.facilityType.facilityName.toLowerCase().includes("camping")
  // )

  const menuContent = data?.allStrapiMenus?.nodes || []

  const [advisoryLoadError, setAdvisoryLoadError] = useState(false)
  const [isLoadingAdvisories, setIsLoadingAdvisories] = useState(true)
  const [advisories, setAdvisories] = useState([])

  useEffect(() => {
    setIsLoadingAdvisories(true)

    loadAdvisories(apiBaseUrl, park?.orcs)
      .then(response => {
        if (response.status === 200) {
          setAdvisories([...response.data])
          setAdvisoryLoadError(false)
        } else {
          setAdvisories([])
          setAdvisoryLoadError(true)
        }
      })
      .finally(() => {
        setIsLoadingAdvisories(false)
      })
  }, [apiBaseUrl, park?.orcs])

  const parkOverviewRef = useRef("")
  const accessibilityRef = useRef("")
  const advisoryRef = useRef("")
  const parkDatesRef = useRef("")
  const safetyRef = useRef("")
  const campingRef = useRef("")
  const facilityRef = useRef("")
  const activityRef = useRef("")
  const mapLocationRef = useRef("")
  const activityMapRef = useRef("")
  const aboutRef = useRef("")
  const reconciliationRef = useRef("")

  const sectionRefs = [
    parkOverviewRef,
    accessibilityRef,
    advisoryRef,
    parkDatesRef,
    safetyRef,
    campingRef,
    facilityRef,
    activityRef,
    mapLocationRef,
    activityMapRef,
    aboutRef,
    reconciliationRef,
  ]

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    defaultValue: 0,
    offsetPx: -250,
  })

  const menuItems = [
    {
      sectionIndex: 0,
      display: "Site overview",
      link: "#park-overview-container",
      visible: site.description,
    },
    {
      sectionIndex: 1,
      display: "Accessibility",
      link: "#accessibility-details-container",
      visible: park?.accessibility,
    },
    {
      sectionIndex: 2,
      display:
        !isLoadingAdvisories && !advisoryLoadError
          ? `Advisories (${advisories.length})`
          : "Advisories",
      link: "#park-advisory-details-container",
      visible: true,
    },
    {
      sectionIndex: 3,
      display: "Facilities",
      link: "#park-facility-container",
      visible: activeFacilities.length > 0,
    },
    {
      sectionIndex: 4,
      display: "Activities",
      link: "#park-activity-container",
      visible: activeActivities.length > 0,
    },
    {
      sectionIndex: 5,
      display: "Location",
      link: "#park-maps-location-container",
      visible: (site.latitude && site.longitude) || site.locationNotes,
    },
  ]

  const mapData = {
    latitude: site.latitude,
    longitude: site.longitude,
    mapZoom: site.mapZoom,
    parkOrcs: site.orcsSiteNumber
  }

  const siteDescription = site.description?.replace(/(<([^>]+)>)/ig, '');
  const siteDescriptionShort = truncate(siteDescription, { length: 160 });

  const breadcrumbs = [
    <Link key="1" href="/">
      Home
    </Link>,
    <Link key="2" href="/find-a-park">
      Find a Park
    </Link>,
    <Link key="3" href={`/${park?.slug ? park.slug : 'parks/protected-area'}`}>
      {park?.protectedAreaName}
    </Link>,
    <div key="4" className="breadcrumb-text">
      {site.siteName}
    </div>,
  ]

  return (
    <div className="grey-background">
      <Seo
        title={`${park?.protectedAreaName}: ${site.siteName}`}
        description={siteDescriptionShort}
      />
      <Header mode="internal" content={menuContent} />
      <ScrollToTop />
      <CssBaseline />

      <div className="d-block d-sm-block d-xs-block d-md-block d-lg-none d-xl-none">
        <Grid item xs={12} sm={12}>
          <ParkPhotoGallery photos={photos} />
        </Grid>
      </div>
      <div className="container parks-container">
        <Container className="park-info-container" maxWidth={false}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <div className="p30t d-none d-xl-block d-lg-block d-md-none d-sm-none d-xs-none" />
              <Breadcrumbs
                separator="›"
                aria-label="breadcrumb"
                className="p20t"
              >
                {breadcrumbs}
              </Breadcrumbs>
            </Grid>
            <Grid item xs={12} sm={12}>
              <ParkHeader
                parkName={`${park?.protectedAreaName}: ${site.siteName}`}
                hasReservations={hasReservations}
                hasDayUsePass={hasDayUsePass}
                isLoadingAdvisories={isLoadingAdvisories}
                advisoryLoadError={advisoryLoadError}
                advisories={advisories}
              />
            </Grid>
          </Grid>
        </Container>
      </div>
      <div className="page-menu--mobile">
        <div className="d-block d-md-none">
          <PageMenu
            pageSections={menuItems}
            activeSection={activeSection}
            menuStyle="select"
          />
        </div>
      </div>
      <div className="container parks-container">
        <Container className="park-info-container" maxWidth={false}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <div className="d-none d-xl-block d-lg-block d-md-none d-sm-none d-xs-none">
                <ParkPhotoGallery photos={photos} />
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={3}
              lg={3}
              className="page-menu--desktop d-none d-xl-block d-lg-block d-md-none d-sm-none d-xs-none"
            >
              <PageMenu
                pageSections={menuItems}
                activeSection={activeSection}
                menuStyle="nav"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={9}
              lg={9}
              className={classes.parkContent}
            >
              {menuItems[0].visible && (
                <div ref={parkOverviewRef} className="full-width">
                  <ParkOverview data={site.description} type="site" />
                </div>
              )}
              {menuItems[1].visible && (
                <div ref={accessibilityRef} className="full-width">
                  <AccessibilityDetails />
                </div>
              )}
              {menuItems[2].visible && (
                <div ref={advisoryRef} className="full-width">
                  {isLoadingAdvisories && (
                    <div className="mb-5">
                      <Heading>{`Advisories`}</Heading>
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}
                  {!isLoadingAdvisories && advisoryLoadError && (
                    <div className="mb-5">
                      <div className="alert alert-danger" role="alert">
                        An error occurred while loading current public
                        advisories.
                      </div>
                    </div>
                  )}
                  {!isLoadingAdvisories && !advisoryLoadError && (
                    <AdvisoryDetails advisories={advisories} />
                  )}
                </div>
              )}
              {menuItems[3].visible && (
                <div ref={facilityRef} className="full-width">
                  <ParkFacility data={activeFacilities} />
                </div>
              )}
              {menuItems[4].visible && (
                <div ref={activityRef} className="full-width">
                  <ParkActivity data={activeActivities} />
                </div>
              )}
              {menuItems[5].visible && (
                <div ref={mapLocationRef} className="full-width">
                  <div id="park-maps-location-container" className="anchor-link">
                    <MapLocation data={mapData} />
                    {site.locationNotes && (
                      <Grid item xs={12} id="park-location-notes-container">
                        <Box mb={8}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: site.locationNotes,
                            }}
                          ></div>
                        </Box>
                      </Grid>
                    )}
                  </div>
                </div>
              )}
              <br />
              <br />
              <br />
            </Grid>
          </Grid>
        </Container>
      </div>
      <Footer />
    </div>
  )
}

export const query = graphql`
  query SiteDetails($orcsSiteNumber: String) {
    strapiSites(orcsSiteNumber: { eq: $orcsSiteNumber }) {
      siteName
      siteNumber
      orcsSiteNumber
      mapZoom
      longitude
      latitude
      locationNotes
      description
      hasDayUsePass
      isUnofficialSite
      protectedArea {
        orcs
        slug
        protectedAreaName
      }
      parkActivities {
        isActive
        isActivityOpen
        description
        activityType {
          activityName
          activityCode
          isActive
          icon
          iconNA
          rank
        }
      }
      parkFacilities {
        isActive
        isFacilityOpen
        description
        facilityType {
          facilityName
          facilityCode
          isActive
          icon
          iconNA
          rank
        }
      }
      parkOperation {
        hasReservations
      }

    }
    # Site photos are split into featured and non-featured in order to sort correctly,
    # with null values last.
    featuredPhotos: allStrapiParkPhoto(
      filter: {
        orcsSiteNumber: { eq: $orcsSiteNumber }
        isFeatured: { eq: true }
        isActive: { eq: true }
      }
      sort: {
        order: [ASC, DESC, DESC]
        fields: [sortOrder, dateTaken, strapiId]
      }
    ) {
      nodes {
        imageUrl
        caption
      }
    }
    regularPhotos: allStrapiParkPhoto(
      filter: {
        orcsSiteNumber: { eq: $orcsSiteNumber }
        isFeatured: { ne: true }
        isActive: { eq: true }
      }
      sort: {
        order: [ASC, DESC, DESC]
        fields: [sortOrder, dateTaken, strapiId]
      }
    ) {
      nodes {
        imageUrl
        caption
      }
    }
    allStrapiMenus(
      sort: { fields: order, order: ASC }
      filter: { show: { eq: true } }
    ) {
      nodes {
        strapiId
        title
        url
        order
        id
        imgUrl
        strapiChildren {
          id
          title
          url
          order
          parent
        }
        strapiParent {
          id
          title
        }
      }
    }
    site {
      siteMetadata {
        apiURL
      }
    }
  }
`
