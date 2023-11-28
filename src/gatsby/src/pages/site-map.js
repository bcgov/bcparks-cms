import React from "react"
import { graphql } from "gatsby"
import { Link, Breadcrumbs } from "@mui/material"

import Footer from "../components/footer"
import Header from "../components/header"
import MegaMenu from "../components/megaMenu.js"
import Seo from "../components/seo"

import "../styles/staticContent1.scss"

const SitemapPage = ({ data }) => {
  const menuContent = data?.allStrapiMenu?.nodes || []

  const breadcrumbs = [
    // TODO convert MUI breadcrumbs and use gatsby Link
    <Link key="1" href="/" underline="hover">
      Home
    </Link>,
    <div key="2" className="breadcrumb-text">
      Site map
    </div>,
  ]

  return (
    <>
      <Header mode="internal" content={menuContent} />

      <div id="main-content" className="static-content-container">
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          className="p10t sm-p10"
        >
          {breadcrumbs}
        </Breadcrumbs>
        <div className="sitemap-header">Site map</div>
        This is the main structure of the website, subject to change.
        <MegaMenu content={menuContent} menuMode="sitemap" />
      </div>
      <Footer />
    </>
  )
}

export default SitemapPage

export const Head = () => (
  <Seo title="Site map" />
)

export const query = graphql`
  {
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
