import React, { useState } from "react"
import { graphql, useStaticQuery, Link as GatsbyLink  } from "gatsby"
import { Breadcrumbs, Link } from "@mui/material"

import Header from "../../components/header"
import Footer from "../../components/footer"
import Seo from "../../components/seo"
import ScrollToTop from "../../components/scrollToTop"

import "../../styles/listPage.scss"

const replaceSpecialCharacters = require('replace-special-characters')

const ParkLink = ({ park }) => {

  return (
    <p>
      <GatsbyLink to={`/${park.slug}`}>
        {park.protectedAreaName}
      </GatsbyLink>
    </p>
  )
}

const ParksPage = () => {
  const queryData = useStaticQuery(graphql`
    query {
      allStrapiProtectedArea(
        sort: {protectedAreaName: ASC}
        filter: {isDisplayed: {eq: true}}
      ) {
        nodes {
          slug
          protectedAreaName
        }
      }
      allStrapiMenu(
        sort: {order: ASC},
        filter: {show: {eq: true}}
      ) {
        nodes {
          strapi_id
          title
          url
          order
          id
          strapi_children {
            id
            title
            url
            order
          }
          strapi_parent {
            id
            title
          }
        }
      }
    }
  `)

  const menuContent = queryData?.allStrapiMenu?.nodes || []
  const parks = queryData?.allStrapiProtectedArea?.nodes || []
  parks.sort((a, b) => {
    // compare protected area name including special characters
    const parkA = replaceSpecialCharacters(a.protectedAreaName).toLowerCase()
    const parkB = replaceSpecialCharacters(b.protectedAreaName).toLowerCase()
    if (parkA < parkB) { return -1 }
    if (parkA > parkB) { return 1 }
    return 0;
  })

  const [currentFilter, setCurrentFilter] = useState("All")

  const handleClick = (e) => {
    setCurrentFilter(e.target.value)
  }
  const filtering = (char) =>
    parks.filter(park => replaceSpecialCharacters(park.protectedAreaName).charAt(0).toUpperCase() === char)

  const filters = [
    "All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ]
  const breadcrumbs = [
    <Link key="1" href="/" underline="hover">
      Home
    </Link>,
    <Link key="2" href="/find-a-park" underline="hover">
      Find a Park
    </Link>,
    <div key="3" className="breadcrumb-text">
      A–Z park list
    </div>,
  ]

  return (
    <div className="list-page">
      <ScrollToTop />
      <div className="max-width-override">
        <Header mode="internal" content={menuContent} />
      </div>
      <div id="main-content" className="static-content--header unique-page--header page-breadcrumbs">
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {breadcrumbs}
        </Breadcrumbs>
      </div>
      <div className="static-content-container">
        <h1 className="header-title">
          A–Z park list
        </h1>
      </div>

      <div className="static-content-container">
        <div className="page-content-wrapper">
          <div>
            <h3>Filter</h3>
            <div className="filters">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  value={filter}
                  onClick={(e) => handleClick(e, filter)}
                  className={
                    `btn btn-selected--${
                      currentFilter === filter ? 'true' : 'false'
                    }`
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="lists">
            {currentFilter === "All" ? (
              filters.map((filter, index) => (
                <div key={index} className="list">
                  {filter !== "All" && <h3>{filter}</h3>}
                  {filtering(filter).map((park, index) => (
                    <ParkLink park={park} key={index} />
                  ))}
                </div>
              ))
            ) : (
              <div className="list">
                <h3>{currentFilter}</h3>
                {filtering(currentFilter).map((park, index) => (
                  <ParkLink park={park} key={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-width-override">
        <Footer />
      </div>
    </div>
  )
}

export default ParksPage

export const Head = () => (
  <Seo title="A–Z park list" />
)
