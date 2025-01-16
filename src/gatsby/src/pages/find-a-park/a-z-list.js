import React, { useState } from "react"
import { graphql, useStaticQuery, Link } from "gatsby"

import Breadcrumbs from "../../components/breadcrumbs"
import Header from "../../components/header"
import Footer from "../../components/footer"
import Seo from "../../components/seo"
import ScrollToTop from "../../components/scrollToTop"
import NoSearchResults from "../../components/search/noSearchResults"

import "../../styles/listPage.scss"

const ParkLink = ({ park }) => {

  return (
    <p>
      <Link to={`/${park.slug}`}>
        {park.protectedAreaName}
      </Link>
    </p>
  )
}

const ParksPage = () => {
  const queryData = useStaticQuery(graphql`
    query {
      allStrapiProtectedArea(
        sort: {slug: ASC}
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
          show
          strapi_children {
            id
            title
            url
            order
            show
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
  const [currentFilter, setCurrentFilter] = useState("All")

  const handleClick = (e) => {
    setCurrentFilter(e.target.value)
  }
  const filtering = (char) =>
    parks.filter(park => park.slug.charAt(0).toUpperCase() === char)
  const hasResult = filtering(currentFilter).length > 0
  const filters = [
    "All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ]
  const breadcrumbs = [
    <Link key="1" to="/">
      Home
    </Link>,
    <Link key="2" to="/find-a-park">
      Find a Park
    </Link>,
    <div key="3" className="breadcrumb-text">
      A–Z park list
    </div>,
  ]

  return (
    <div className="list-page">
      <div className="max-width-override">
        <Header mode="internal" content={menuContent} />
      </div>
      <div id="main-content" tabIndex={-1} className="static-content--header unique-page--header page-breadcrumbs">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className="static-content-container">
        <h1 className="header-title">
          A–Z park list
        </h1>
      </div>

      <div className="static-content-container">
        <div className="page-content-wrapper">
          <div>
            <h2 className="sub-heading">Filter</h2>
            <div className="filters">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  value={filter}
                  aria-label={filter}
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
                {hasResult ? 
                  filtering(currentFilter).map((park, index) => (
                    <ParkLink park={park} key={index} />
                  ))
                  : <NoSearchResults page="a-z-list" />
                }
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-width-override">
        <ScrollToTop />
        <Footer />
      </div>
    </div>
  )
}

export default ParksPage

export const Head = () => (
  <Seo title="A–Z park list" />
)
