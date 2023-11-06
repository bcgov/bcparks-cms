import React, { useRef } from "react"
import { graphql, Link as GatsbyLink, navigate } from "gatsby"
import { Breadcrumbs } from "@mui/material"
import useScrollSpy from "react-use-scrollspy"

import Footer from "../components/footer"
import Header from "../components/header"
import HTMLArea from "../components/HTMLArea"
import Seo from "../components/seo"
import PageContent from "../components/pageContent/pageContent"
import PageMenu from "../components/pageContent/pageMenu"
import ScrollToTop from "../components/scrollToTop"

import "../styles/staticContent1.scss"

const slugify = require("slugify")

export default function ParkSubPage({ data }) {
  const page = data.strapiParkSubPage
  const contents = page.content
  const header = page.pageHeader
  const park = page.protectedArea
  const menuContent = data?.allStrapiMenu?.nodes || []
  const sections = contents?.filter(content => Boolean(content.strapi_component === "parks.page-section")) || []
  const hasSections = sections.length > 0
  const filteredContent = contents?.filter(c =>
    Boolean(c.strapi_component !== "parks.page-header") &&
    Boolean(c.strapi_component !== "parks.seo")
  ) || []

  let pageSections = []
  if (hasSections) {
    let sectionIndex = 0
    for (const section of sections) {
      sectionIndex += 1
      section.sectionIndex = sectionIndex
      // if pageSection doesn't have a sectionTitle, display page title
      if (!section.sectionTitle) {
        section.sectionTitle = page.title
      }
      const titleId = slugify(section.sectionTitle).toLowerCase()
      pageSections.push({
        display: section.sectionTitle,
        sectionIndex: sectionIndex,
        id: section.id,
        link: "#" + titleId,
        visible: true
      })
    }
  }

  let sectionRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    defaultValue: 0,
    offsetPx: -100,
  })

  const breadcrumbs = [
    <GatsbyLink key="1" to="/">
      Home
    </GatsbyLink>,
    <GatsbyLink
      key="2"
      to="/find-a-park"
      onClick={(e) => {
      if (sessionStorage.getItem("lastSearch")) {
          e.preventDefault();
          navigate('/find-a-park/' + sessionStorage.getItem("lastSearch"))
        }
      }}
    >
      Find a park
    </GatsbyLink>,
    <GatsbyLink key="3" to={`/${park.slug}`}>
      {park.protectedAreaName}
    </GatsbyLink>,
    <div key="4" className="breadcrumb-text">
      {page.title}
    </div>,
  ]

  return (
    <>
      <ScrollToTop />
      <div className="max-width-override" ref={sectionRefs[0]}>
        <Header mode="internal" content={menuContent} />
      </div>
      <div className="static-content--header">
        <div id="sr-content" className="page-breadcrumbs">
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            {breadcrumbs}
          </Breadcrumbs>
        </div>
        {header?.imageUrl && (
          <div className="header-image-wrapper">
            <img
              src={header.imageUrl}
              alt=""
            />
          </div>
        )}
        <h1 className="header-title">
          {park.protectedAreaName}: {header?.title ?? page.title}
        </h1>
      </div>
      {hasSections && (
        <div className="page-menu--mobile">
          <div className="d-block d-lg-none">
            <PageMenu
              pageSections={pageSections}
              activeSection={activeSection}
              menuStyle="select"
            />
          </div>
        </div>
      )}
      <div className="static-content-container">
        <div className="page-content-wrapper">
          {hasSections ? (
            <div className="row no-gutters">
              <div className="page-menu--desktop col-lg-4 col-12 d-none d-lg-block">
                <div className="">
                  <PageMenu
                    pageSections={pageSections}
                    activeSection={activeSection}
                    menuStyle="nav"
                  />
                </div>
              </div>
              <div className="page-content col-lg-8 col-12">
                {header && (
                  <div className="header-content">
                    {header.introHtml.data.introHtml &&
                      <HTMLArea isVisible>{header.introHtml.data.introHtml}</HTMLArea>
                    }
                  </div>
                )}
                {filteredContent.map(content => (
                  <div
                    ref={sectionRefs[content.sectionIndex]}
                    key={content.strapi_component + "-" + content.id}
                  >
                    <PageContent
                      contentType={content.strapi_component}
                      content={content}
                    ></PageContent>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {header && header.introHtml.data.introHtml && (
                <div className="header-content">
                  <HTMLArea isVisible>{header.introHtml.data.introHtml}</HTMLArea>
                </div>
              )}
              {filteredContent.map(content => (
                <PageContent
                  contentType={content.strapi_component}
                  content={content}
                  key={content.strapi_component + "-" + content.id}
                ></PageContent>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="max-width-override">
        <Footer />
      </div>
    </>
  )
}

export const Head = ({ data }) => {
  const page = data.strapiParkSubPage
  const park = page.protectedArea
  const seo = page.seo

  return (
    <Seo
      title={seo?.metaTitle ?? park.protectedAreaName + ": " + page.title}
      description={seo?.metaDescription}
      keywords={seo?.metaKeywords}
      image={page.pageHeader?.imageUrl}
    />
  )
}

export const query = graphql`
  query ParkSubPageDetails($slug: String, $protectedAreaSlug: String) {
    strapiParkSubPage(
      slug: {eq: $slug}
      protectedArea: {slug: {eq: $protectedAreaSlug}}
    ) {
      id
      slug
      title
      oldUrl
      content {
        ... on STRAPI__COMPONENT_PARKS_HTML_AREA {
          id
          strapi_id
          strapi_component
          HTML {
            data {
              HTML
            }
          }
        }
        ... on STRAPI__COMPONENT_PARKS_PAGE_SECTION {
          id
          strapi_id
          strapi_component
          sectionTitle
          sectionHTML {
            data {
              sectionHTML
            }
          }
        }
      }
      seo {
        metaDescription
        metaKeywords
        metaTitle
      }
      pageHeader {
        imageUrl
        introHtml {
          data {
            introHtml
          }
        }
        pageTitle
      }
      protectedArea {
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
`