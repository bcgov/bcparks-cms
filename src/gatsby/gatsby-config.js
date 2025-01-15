require("dotenv").config({
  path: `.env`,
})

module.exports = {
  siteMetadata: {
    title: `BC Parks`,
    description: `BC Parks`,
    author: `@bcparks`,
    apiURL: process.env.REACT_APP_CMS_BASE_URL,
    siteUrl: process.env.REACT_APP_SITE_URL,
    image: 'https://nrs.objectstore.gov.bc.ca/kuwyyf/generic_social_1146x600_603acfb441.jpg'
  },
  plugins: [
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://bcparks.ca`,
      },
    },
    `gatsby-plugin-sass`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: "gatsby-source-strapi",
      options: {
        skipFileDownloads: true,
        apiURL: process.env.STRAPI_SOURCE_URL || process.env.REACT_APP_CMS_BASE_URL,
        accessToken: process.env.STRAPI_TOKEN,
        collectionTypes: [
          "access-status",
          "activity-type",
          "facility-type",
          "camping-type",
          "guideline-type",
          "park-guideline",
          "legacy-redirect",
          "menu",
          "footer-menu",
          "park-operation",
          "park-operation-date",
          "park-operation-sub-area",
          "park-operation-sub-area-date",
          "park-operation-sub-area-type",
          "park-contact",
          "park-operator-contact",
          "park-photo",
          "park-sub-page",
          "public-advisory",
          "search-area",
          "search-city",
          "management-document",
          "emergency-alert",
          {
            singularName: "page",
            queryParams: {
              populate: {
                PageHeader: {
                  fields: "*"
                },
                Seo: {
                  fields: "*"
                },
                Content: {
                  populate: ["cards"]
                }
              }
            }
          },
          {
            singularName: "protected-area",
            queryParams: {
              populate: {
                parkActivities: {
                  populate: ["activityType"]
                },
                parkFacilities: {
                  populate: ["facilityType"]
                },
                parkCampingTypes: {
                  populate: ["campingType"]
                },
                parkGuidelines: {
                  populate: ["guidelineType"]
                },
                parkOperation: {
                  fields: "*"
                },
                parkOperationDates: {
                  fields: "*"
                },
                parkOperationSubAreas: {
                  fields: "*",
                  populate: {
                    parkOperationSubAreaType: {
                      fields: "*"
                    }
                  }
                },
                managementDocuments: {
                  populate: ["documentType"]
                },
                biogeoclimaticZones: {
                  fields: "*"
                },
                marineEcosections: {
                  fields: "*"
                },
                terrestrialEcosections: {
                  fields: "*"
                },
                seo: {
                  populate: "*"
                },
                fireZones: {
                  populate: ["fireCentre"]
                },
                naturalResourceDistricts: {
                  fields: "*"
                },
                managementAreas: {
                  populate: ["region", "section", "searchArea"]
                },
                parkPhotos: {
                  fields: "*"
                },
                parkNameAudio: {
                  fields: "*"
                },
                trailReports: {
                  fields: "*"
                },
                nearbyParks: {
                  populate: ["orcs", "slug", "protectedAreaName"],
                  parkPhotos: {
                    populate: ["isActive", "isFeatured", "sortOrder", "imageUrl"]
                  },
                  parkActivities: {
                    populate: ["isActive", {
                      activityType: ["activityNumber", "activityCode", "isActive"]
                    }]
                  },
                  parkFacilities: {
                    populate: ["isActive", {
                      facilityType: ["facilityNumber", "facilityCode", "isActive"]
                    }]
                  },
                  parkCampingTypes: {
                    populate: ["isActive", {
                      campingType: ["campingTypeNumber", "campingTypeCode", "isActive"]
                    }]
                  },
                },
                parkContacts: {
                  populate: ["parkOperatorContact"]
                }
              }
            },
            queryLimit: 100
          },
          {
            singularName: "site",
            queryParams: {
              populate: {
                protectedArea: {
                  fields: "*"
                },
                parkActivities: {
                  populate: ["activityType"]
                },
                parkFacilities: {
                  populate: ["facilityType"]
                },
                parkCampingTypes: {
                  populate: ["campingType"]
                },
                parkGuidelines: {
                  populate: ["guidelineType"]
                },
                parkOperation: {
                  fields: "*"
                },
                parkOperationDates: {
                  fields: "*"
                },
                trailReports: {
                  fields: "*"
                }
              }
            }
          },
        ]
      }
    },
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`auto`, `webp`],
          placeholder: `dominantColor`,
          quality: 90,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `bcparks.ca`,
        short_name: `bcparks.ca`,
        start_url: `/`,
        background_color: `#003366`,
        theme_color: `#003366`,
        display: `minimal-ui`,
        icon: `src/images/bcid-favicon-32x32.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-meta-redirect`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: '/'
      }
    },
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        sitemap: "https://bcparks.ca/sitemap-index.xml",
        resolveEnv: () => process.env.ENV_SUFFIX || 'dev',
        env: {
          'dev': {
            policy: [{ userAgent: '*', disallow: ['/'] }]
          },
          'test': {
            policy: [{ userAgent: '*', disallow: ['/'] }]
          },
          'prod': {
            policy: [{ userAgent: '*', allow: ['/'] }]
          },
        },
      },
    },
  ],
}
