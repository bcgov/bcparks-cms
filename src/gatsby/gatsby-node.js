const { graphql } = require("gatsby")
const slugify = require("slugify")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const parseUrl = require("parse-url")

const strapiApiRequest = (graphql, query) =>
  new Promise((resolve, reject) => {
    resolve(
      graphql(query).then(result => {
        if (result.errors) {
          reject(result.errors)
        }
        return result
      })
    )
  })

exports.onPostBuild = ({ reporter }) => {
  reporter.info(`Pages have been built!`)
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  const typeDefs = `
  type STRAPI_ACCESS_STATUS implements Node {
    groupLabel: String
  }

  type STRAPI_BIOGEOCLIMATIC_ZONE implements Node @dontInfer {
    zone: String
    zoneCode: String
    protectedAreas: [STRAPI_PROTECTED_AREA] @link(by: "id", from: "protectedAreas___NODE")
  }

  type STRAPI_MARINE_ECOSECTION implements Node @dontInfer {
    marineEcosectionId: Int
    marineEcosection: String
    marineEcosectionCode: String
    protectedAreas: [STRAPI_PROTECTED_AREA] @link(by: "id", from: "protectedAreas___NODE")
  }

  type STRAPI_TERRESTRIAL_ECOSECTION implements Node @dontInfer {
    terrestrialEcosectionId: Int
    terrestrialEcosection: String
    terrestrialEcosectionCode: String
    parentEcoregionCode: String
    protectedAreas: [STRAPI_PROTECTED_AREA] @link(by: "id", from: "protectedAreas___NODE")
  }

  type DATA implements Node {
    data: String
  }

  type STRAPI_ACTIVITY_TYPE implements Node {
    appendStandardCalloutText: DATA
  }

  type STRAPI_FACILITY_TYPE implements Node {
    appendStandardCalloutText: DATA
  }

  type STRAPI_CAMPING_TYPE implements Node {
    appendStandardCalloutText: DATA
    defaultDescription: DATA
  }

  type STRAPI_PARK_ACTIVITY implements Node {
    activityType: STRAPI_ACTIVITY_TYPE
    hideStandardCallout: Boolean
  }
  
  type STRAPI_PARK_FACILITY implements Node {
    facilityType: STRAPI_FACILITY_TYPE
    hideStandardCallout: Boolean
  }

  type STRAPI_PARK_CAMPING_TYPE implements Node {
    campingType: STRAPI_CAMPING_TYPE
    hideStandardCallout: Boolean
  }
  
  type STRAPI_GUIDELINE_TYPE implements Node @dontInfer {
    guidelineNumber: Int
    guidelineName: String
    icon: String
    defaultTitle: String
    defaultDescription: DATA
  }

  type STRAPI_PARK_GUIDELINE implements Node @dontInfer {
    name: String
    order: Int
    isActive: Boolean
    overrideTitle: Boolean
    overrideDescription: Boolean
    appendDescription: Boolean
    title: String
    description: DATA
    guidelineType: STRAPI_GUIDELINE_TYPE
  }

  type STRAPI_PROTECTED_AREA implements Node {
    managementDocuments:[STRAPI_MANAGEMENT_DOCUMENT] @link(by: "id", from: "managementDocuments___NODE")
    biogeoclimaticZones: [STRAPI_BIOGEOCLIMATIC_ZONE] @link(by: "id", from: "biogeoclimaticZones___NODE")
    marineEcosections: [STRAPI_MARINE_ECOSECTION] @link(by: "id", from: "marineEcosections___NODE")
    terrestrialEcosections: [STRAPI_TERRESTRIAL_ECOSECTION] @link(by: "id", from: "terrestrialEcosections___NODE")
    parkActivities: [STRAPI_PARK_ACTIVITY] @link(by: "id", from: "parkActivities___NODE")
    parkFacilities: [STRAPI_PARK_FACILITY] @link(by: "id", from: "parkFacilities___NODE")
    parkCampingTypes: [STRAPI_PARK_CAMPING_TYPE] @link(by: "id", from: "parkCampingTypes___NODE")
    parkGuidelines: [STRAPI_PARK_GUIDELINE] @link(by: "id", from: "parkGuidelines___NODE")
    seo: STRAPI__COMPONENT_PARKS_SEO
    hasDiscoverParksLink: Boolean
    nearbyParkOne: STRAPI_PROTECTED_AREA @link(by: "id", from: "nearbyParkOne___NODE")
    nearbyParkTwo: STRAPI_PROTECTED_AREA @link(by: "id", from: "nearbyParkTwo___NODE")
    nearbyParkThree: STRAPI_PROTECTED_AREA @link(by: "id", from: "nearbyParkThree___NODE")
  }
  
  type STRAPI__COMPONENT_PARKS_RTE_LIST_CONTENT_TEXTNODE implements Node @dontInfer {
    content: String
  }

  type STRAPI__COMPONENT_PARKS_RTE_LISTContent {
    data: STRAPI__COMPONENT_PARKS_RTE_LIST_CONTENT_TEXTNODE @link(by: "id", from: "data___NODE")
  }

  type STRAPI__COMPONENT_PARKS_RTE_LIST implements Node @derivedTypes @dontInfer {
    description: String
    content: STRAPI__COMPONENT_PARKS_RTE_LISTContent
  }

  type STRAPI_PARK_OPERATION implements Node {
    totalCapacity: String
    gateOpenTime: String
    gateCloseTime: String
    hasPicnicShelterReservations: Boolean
    customReservationLinks: [STRAPI__COMPONENT_PARKS_RTE_LIST] @link(by: "id", from: "customReservationLinks___NODE")
  }

  type STRAPI_PARK_OPERATION_SUB_AREA implements Node {
    nonReservableSites: String
    vehicleSitesReservable: String
    pullThroughSites: String
    rvSitesReservable: String
    longStaySites: String
    groupSitesReservable: String
    boatLaunches: String
    closureAffectsAccessStatus: Boolean
  }

  type STRAPI_PARK_OPERATION_SUB_AREA_TYPE implements Node {
    closureAffectsAccessStatus: Boolean
  }

  type STRAPI__COMPONENT_PARKS_PAGE_HEADER_INTROHTML_TEXTNODE implements Node @dontInfer {
    introHtml: String
  }
  
  type STRAPI__COMPONENT_PARKS_PAGE_HEADER_INTROHTML implements Node {
    data: STRAPI__COMPONENT_PARKS_PAGE_HEADER_INTROHTML_TEXTNODE @link(by: "id", from: "data___NODE")
  }

  type STRAPI__COMPONENT_PARKS_PAGE_HEADER implements Node {
    strapi_id: Int
    strapi_component: String
    pageTitle: String
    imageUrl: String
    introHtml: STRAPI__COMPONENT_PARKS_PAGE_HEADER_INTROHTML
  }

  type STRAPI__COMPONENT_PARKS_PAGE_SECTION_SECTIONHTML_TEXTNODE implements Node @dontInfer {
    sectionHTML: String
  }
  
  type STRAPI__COMPONENT_PARKS_PAGE_SECTION implements Node @derivedTypes @dontInfer {
    strapi_id: Int
    strapi_component: String
    sectionTitle: String
    sectionHTML: STRAPI__COMPONENT_PARKS_PAGE_SECTIONSectionHTML
  }
  
  type STRAPI__COMPONENT_PARKS_PAGE_SECTIONSectionHTML {
    data: STRAPI__COMPONENT_PARKS_PAGE_SECTION_SECTIONHTML_TEXTNODE @link(by: "id", from: "data___NODE")
  }
  
  type STRAPI__COMPONENT_PARKS_HTML_AREA_HTML_TEXTNODE implements Node @dontInfer {
    HTML: String
  }

  type STRAPI__COMPONENT_PARKS_HTML_AREA_HTML {
    data: STRAPI__COMPONENT_PARKS_HTML_AREA_HTML_TEXTNODE @link(by: "id", from: "data___NODE")
  }

  type STRAPI__COMPONENT_PARKS_HTML_AREA implements Node @derivedTypes @dontInfer {
    strapi_id: Int
    strapi_component: String
    HTML: STRAPI__COMPONENT_PARKS_HTML_AREA_HTML
  }  

  type STRAPI__COMPONENT_PARKS_LINK_CARD implements Node @dontInfer {
    strapi_id: Int
    strapi_component: String
    title: String
    url: String
    imageUrl: String
    imageAltText: String
    subTitle: String
    buttonText: String
    variation: String
  }

  type STRAPI__COMPONENT_PARKS_CARD_SET implements Node @dontInfer {
    strapi_id: Int
    strapi_component: String
    cards: [STRAPI__COMPONENT_PARKS_LINK_CARD] @link(by: "id", from: "cards___NODE")
  }

  type STRAPI__COMPONENT_PARKS_SEO implements Node {
    strapi_id: Int
    strapi_component: String
    metaKeywords: String
    metaTitle: String
    metaDescription: String
  }

  type STRAPI__COMPONENT_PARKS_FANCY_LINK implements Node @dontInfer {
    linkText: String
    url: String
  }

  type STRAPI_SITE_SAFETYINFO_TEXTNODE implements Node @dontInfer {
    safetyInfo: String
  }

  type STRAPI_SITE_SAFETYINFO {
    data: STRAPI_SITE_SAFETYINFO_TEXTNODE @link(by: "id", from: "data___NODE")
  }

  type STRAPI_SITE implements Node {
    safetyInfo: STRAPI_SITE_SAFETYINFO
    parkOperation: STRAPI_PARK_OPERATION
    parkActivities: [STRAPI_PARK_ACTIVITY] @link(by: "id", from: "parkActivities___NODE")
    parkFacilities: [STRAPI_PARK_FACILITY] @link(by: "id", from: "parkFacilities___NODE")
    parkCampingTypes: [STRAPI_PARK_CAMPING_TYPE] @link(by: "id", from: "parkCampingTypes___NODE")
  }

  type STRAPI_MANAGEMENT_DOCUMENT_TYPE implements Node {
    documentCode: String
    documentType: String
    description: String
  }

  type STRAPI_MANAGEMENT_DOCUMENT implements Node {
    title: String
    url: String
    description: String
    documentDate: Date
    publishedAt: Date
    documentType: STRAPI_MANAGEMENT_DOCUMENT_TYPE @link(by: "id", from: "documentType___NODE")
    sites: [STRAPI_SITE] @link(by: "id", from: "sites___NODE")
  }

  type STRAPI_EMERGENCY_ALERT implements Node @dontInfer {
    isActive: Boolean
    colour: String
    description: String
    links: [STRAPI__COMPONENT_PARKS_FANCY_LINK] @link(by: "id", from: "links___NODE")
  }

  type STRAPI_FOOTER_MENU_CHILDREN {
    title: String
    order: Int
    url: String
  }

  type STRAPI_FOOTER_MENU implements Node @derivedTypes @dontInfer {
    title: String
    order: Int
    url: String
    strapi_children: [STRAPI_FOOTER_MENU_CHILDREN]
  }

  union ContentUnion = STRAPI__COMPONENT_PARKS_CARD_SET | STRAPI__COMPONENT_PARKS_HTML_AREA | STRAPI__COMPONENT_PARKS_LINK_CARD | STRAPI__COMPONENT_PARKS_PAGE_HEADER | STRAPI__COMPONENT_PARKS_PAGE_SECTION | STRAPI__COMPONENT_PARKS_SEO
  type STRAPI_PAGE implements Node @dontInfer {
    Slug: String
    Title: String
    Template: String
    PageHeader: STRAPI__COMPONENT_PARKS_PAGE_HEADER @link(by: "id", from: "PageHeader___NODE")
    Seo: STRAPI__COMPONENT_PARKS_SEO @link(by: "id", from: "Seo___NODE")
    Content: [ContentUnion] @link(by: "id", from: "Content___NODE")
  }
  `
  createTypes(typeDefs)
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const pageQuery = `
  {
    allStrapiPage(filter: {Slug: {nin: ["/home", "/active-advisories", "/find-a-park"]}}) {
      nodes {
        id
        Slug
        Title
        Template
        PageHeader {
          pageTitle
          imageUrl
          introHtml {
            data {
              introHtml
            }
          }
        }
        Seo {
          metaTitle
          metaDescription
          metaKeywords
        }
        Content {
          ... on STRAPI__COMPONENT_PARKS_CARD_SET {
            id
            strapi_component
            cards {
              id
              url
              title
              subTitle
              buttonText
              imageUrl
              imageAltText
              variation
            }
          }
          ... on STRAPI__COMPONENT_PARKS_HTML_AREA {
            id
            strapi_component
            HTML {
              data {
                HTML
              }
            }
          }
          ... on STRAPI__COMPONENT_PARKS_LINK_CARD {
            id
            strapi_component
            url
            title
            subTitle
            buttonText
            imageUrl
            imageAltText
            variation
          }
          ... on STRAPI__COMPONENT_PARKS_PAGE_HEADER {
            id
            strapi_component
            pageTitle
            imageUrl
            introHtml {
              data {
                introHtml
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
          ... on STRAPI__COMPONENT_PARKS_SEO {
            id
            strapi_component
            metaTitle
            metaKeywords
            metaDescription
          }
        }
      }
      totalCount
    }
  }
  `
  const parkQuery = `
  {
    allStrapiProtectedArea(filter: {isDisplayed: {eq: true}}) {
      nodes {
        id
        orcs
        slug
        protectedAreaName
        url
        oldUrl
      }
      totalCount
    }
  }
  `
  const siteQuery = `
  {
    allStrapiSite(filter: {isDisplayed: {eq: true}}) {
      nodes {
        id
        slug
        siteName
        siteNumber
        orcsSiteNumber
        protectedArea {
          slug
        }
      }
      totalCount
    }
  }
  `
  const parkSubQuery = `
  {
    allStrapiParkSubPage {
      nodes {
        id
        slug
        title
        protectedArea {
          slug
        }
      }
    }
  }
  `
  const redirectQuery = `
  { 
    allStrapiLegacyRedirect {
      nodes {
        toPath
        fromPath
      }
    }
  }
  `

  await createStaticPage(pageQuery, { graphql, actions, reporter })
  await createParkPage(parkQuery, { graphql, actions, reporter })
  await createSitePage(siteQuery, { graphql, actions, reporter })
  await createParkSubPages(parkSubQuery, { graphql, actions, reporter })
  await createRedirects(parkQuery, redirectQuery, { graphql, actions, reporter })
}

async function createStaticPage(query, { graphql, actions, reporter }) {
  const result = await graphql(query)
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query - node create page.`)
    return
  }
  result.data.allStrapiPage.nodes.forEach(page => {
    actions.createPage({
      path: page.Slug.replace(/\/$|$/, `/`),
      component: require.resolve(`./src/templates/${page.Template}.js`),
      context: { page },
    })
  })
}

async function createParkPage(query, { graphql, actions, reporter }) {
  const result = await strapiApiRequest(graphql, query)
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query - node create park page.`)
    return
  }
  result.data.allStrapiProtectedArea.nodes.forEach(park => {
    actions.createPage({
      path: park.slug.replace(/\/$|$/, `/`),
      component: require.resolve(`./src/templates/park.js`),
      context: { ...park },
    })
  })
}

async function createSitePage(query, { graphql, actions, reporter }) {
  const result = await strapiApiRequest(graphql, query)
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query - node create site page.`)
    return
  }
  result.data.allStrapiSite.nodes.forEach(site => {
    // fallback in case site doesn't have a slug
    const slug = site.slug || slugify(site.siteName).toLowerCase()
    // fallback in case site doesn't have a relation with protectedArea
    const parkPath = site.protectedArea?.slug ?? "no-protected-area"
    const sitePath = `${parkPath}/${slug}`
    actions.createPage({
      path: sitePath.replace(/\/$|$/, `/`),
      component: require.resolve(`./src/templates/site.js`),
      context: { ...site },
    })
  })
}

async function createParkSubPages(query, { graphql, actions, reporter }) {
  const result = await strapiApiRequest(graphql, query)
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query - node create park sub page.`)
    return
  }
  result.data.allStrapiParkSubPage.nodes.forEach(parkSubPage => {
    // fallback in case site doesn't have a relation with protectedArea
    const parkPath = parkSubPage.protectedArea?.slug ?? "no-protected-area"
    const parkSubPagePath = `${parkPath}/${parkSubPage.slug}`
    actions.createPage({
      path: parkSubPagePath.replace(/\/$|$/, `/`),
      component: require.resolve(`./src/templates/parkSubPage.js`),
      context: {
        protectedAreaSlug: parkSubPage.protectedArea?.slug,
        ...parkSubPage
      },
    })
  })
}

async function createRedirects(parkQuery, redirectQuery, { graphql, actions, reporter }) {
  const response = await strapiApiRequest(graphql, redirectQuery)
  const resultPark = await strapiApiRequest(graphql, parkQuery)
  const redirects = response.data.allStrapiLegacyRedirect.nodes
  const parks = resultPark.data.allStrapiProtectedArea.nodes

  redirects.map(item => {
    return actions.createRedirect({
      fromPath: item.fromPath,
      toPath: item.toPath,
    })
  })
  parks.map(park => {
    if (park.oldUrl) {
      try {
        const oldUrl = parseUrl(park.oldUrl);
        if (oldUrl?.pathname !== `/${park.slug}/`) {
          return actions.createRedirect({
            fromPath: oldUrl.pathname,
            toPath: park.slug,
          })
        }
      } catch (error) {
        reporter.warn(`Field oldUrl for park ${park.protectedAreaName} could not be parsed`)
      }
    }
  })
}

exports.onCreateWebpackConfig = ({ stage, loaders, actions, getConfig }) => {
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /@arcgis/,
            use: loaders.null(),
          },
        ],
      },
      plugins: [new NodePolyfillPlugin()],
    })
  }
  if (stage === 'build-javascript' || stage === 'develop') {
    const config = getConfig()
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    )
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true
    }
    actions.replaceWebpackConfig(config)
  }
}
