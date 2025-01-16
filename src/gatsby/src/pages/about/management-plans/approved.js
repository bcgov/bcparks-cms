import React, { useState } from "react"
import { graphql, useStaticQuery, Link } from "gatsby"

import Breadcrumbs from "../../../components/breadcrumbs"
import Header from "../../../components/header"
import Footer from "../../../components/footer"
import Seo from "../../../components/seo"
import ScrollToTop from "../../../components/scrollToTop"
import NoSearchResults from "../../../components/search/noSearchResults"

import "../../../styles/listPage.scss"

const DocumentLink = ({ park }) => {
  const docs = park.managementDocuments
  const calcYear = (date) => date.split('-').shift()
  const checkRelation = (orcs, orcsSite) => {
    return orcs.toString() === orcsSite.split("-")[0]
  }
  // sorting links based on full link text
  const titles = []
  docs?.map((doc, index) => (
    doc.sites && doc.sites.length > 0 ? (
      // display link with siteName if there's a relation with site
      doc.sites.map(site =>
        checkRelation(park.orcs, site.orcsSiteNumber) && (
          titles.push({
            index: index,
            title: `${park.protectedAreaName} – ${site.siteName} ${(doc.documentType?.documentType)?.toLowerCase()} (${calcYear(doc.documentDate)})`
          })
        ))
    ) : (
      titles.push({
        index: index,
        title: `${park.protectedAreaName} ${(doc.documentType?.documentType)?.toLowerCase()} (${calcYear(doc.documentDate)})`
      })
    )
  ))
  titles.sort((a, b) => {
    // compare strings without hyphens and spaces
    const titleA = a.title.replace(/-|\s/g, "").toLowerCase()
    const titleB = b.title.replace(/-|\s/g, "").toLowerCase()
    if (titleA < titleB) { return -1 }
    if (titleA > titleB) { return 1 }
    return 0;
  })

  return (
    titles.map((title, index) => (
      <p key={index}>
        <a href={docs[title.index].url} target="_blank" rel="noreferrer">
          {`${title.title} [PDF]`}
        </a>
      </p>
    ))
  )
}

const ApprovedListPage = () => {
  const queryData = useStaticQuery(graphql`
    query {
      allStrapiProtectedArea(
        sort: {slug: ASC}
        filter: {managementDocuments: {elemMatch: {publishedAt: {ne: null}}}}
      ) {
        nodes {
          orcs
          slug
          protectedAreaName
          managementDocuments {
            url
            documentDate
            documentType {
              documentType
            }
            sites {
              orcsSiteNumber
              siteName
            }
          }
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
    <Link key="2" to="/about">
      About
    </Link>,
    <Link key="3" to="/about/management-plans">
      Management plans
    </Link>,
    <div key="4" className="breadcrumb-text">
      Approved management plans
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
          Approved management plans
        </h1>
      </div>
      <div className="static-content-container">
        <p>
          The plans listed below guide management decisions in the respective protected areas.
          Use the filter to look for documents by park name, then click on the document title to download it.
        </p>
        <p>
          If you are looking for a document that is not listed, contact us 
          at <a href="mailto:parkinfo@gov.bc.ca">parkinfo@gov.bc.ca</a> to request a copy.
        </p>
        <p>
          To learn more about what management plans are and how they are developed,
          visit the <Link to="/about/management-plans/planning-process">management planning process</Link> page.
        </p>
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
                    `btn btn-selected--${currentFilter === filter ? 'true' : 'false'
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
                    <DocumentLink park={park} key={index} />
                  ))}
                </div>
              ))
            ) : (
              <div className="list">
                <h3>{currentFilter}</h3>
                {hasResult ? 
                  filtering(currentFilter).map((park, index) => (
                    <DocumentLink park={park} key={index} />
                  ))
                  : <NoSearchResults page="approved" />
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

export default ApprovedListPage

export const Head = () => (
  <Seo
    title="Approved management plans"
    description="The plans listed here guide management decisions in the respective protected areas.
      Use the filter to look for documents by park name, then click on the document title to download it."
  />
)
