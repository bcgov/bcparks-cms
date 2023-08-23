'use strict';

const { doElasticSearch } = require('../../../helpers/elasticClient');

/**
 * search service
 */

module.exports = ({ strapi }) => ({

  searchParks: async ({
    searchText,
    typeCode,
    camping,
    marineProtectedArea,
    activityNumbers,
    facilityNumbers,
    regionNumbers,
    campingNumbers,
    limit,
    offset,
  }) => {

    let textFilter = [];

    if (searchText) {
      textFilter = [
        {
          match_phrase: {
            "protectedAreaName": {
              query: searchText,
              boost: 5
            }
          }
        },
        {
          match_phrase: {
            "parkNames": {
              query: searchText,
              boost: 3
            }
          }
        },
        {
          match_phrase_prefix: {
            "protectedAreaName": {
              query: searchText,
              boost: 1
            }
          }
        },
        {
          match_phrase_prefix: {
            parkNames: {
              query: searchText,
              boost: 1
            }
          }
        },
        {
          multi_match: {
            query: searchText,
            fuzziness: "AUTO",
            type: "best_fields",
            fields: ["parkNames^2", "protectedAreaName^2"],
            operator: "and"
          }
        }
      ];
    }

    let mustFilter = [];
    let campingFilter = [];

    for (const activityNum of activityNumbers) {
      mustFilter.push({ match: { "parkActivities.num": activityNum } })
    }

    for (const facilityNum of facilityNumbers) {
      mustFilter.push({ match: { "parkFacilities.num": facilityNum } })
    }

    for (const campingNum of campingNumbers) {
      campingFilter.push({ match: { "campingFacilities.num": campingNum } })
    }

    if (camping) {
      mustFilter.push({ match: { "hasCamping": true } })
    }

    if (marineProtectedArea) {
      mustFilter.push({ match: { "marineProtectedArea": true } })
    }

    if (typeCode) {
      mustFilter.push({ match: { "typeCode": typeCode } })
    }

    let regionFilter = [];

    for (const regionNum of regionNumbers) {
      regionFilter.push({ match: { "parkLocations.regionNum": regionNum } })
    }

    try {
      const query = {
        index: getIndexName(),
        body: {
          from: offset,
          size: limit,
          query: {
            bool: {
              filter: [
                ...mustFilter,
                {
                  bool: {
                    filter: [
                      {
                        bool: { should: [...regionFilter] }
                      }
                    ],
                    must: [
                      {
                        bool: { should: [...campingFilter] }
                      }
                    ]
                  }
                }
              ],
              must: [
                {
                  bool: { should: [...textFilter] }
                }
              ]
            }
          },
          sort: [
            "_score",
            "nameLowerCase.keyword"
          ],
          _source: [
            "orcs",
            "protectedAreaName",
            "hasCampfireBan",
            "slug",
            "parkFacilities",
            "parkActivities",
            "campingFacilities",
            "parkLocations",
            "advisories",
            "parkPhotos"
          ],
          aggs: {
            activities: {
              terms: {
                field: "parkActivities.num",
                size: 50,
                min_doc_count: 0
              }
            },
            facilities: {
              terms: {
                field: "parkFacilities.num",
                size: 50,
                min_doc_count: 0
              }
            },
            all_regions: {
              global: {},
              aggs: {
                filtered: {
                  filter: {
                    bool: {
                      filter: [...mustFilter],
                      must: [{ bool: { should: [...textFilter] } }]
                    }
                  },
                  aggs: {
                    regions: {
                      terms: {
                        field: "parkLocations.regionNum",
                        min_doc_count: 0
                      }
                    },
                    campings: {
                      terms: {
                        field: "campingFacilities.num",
                        size: 50,
                        min_doc_count: 0
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      const result = await doElasticSearch(query);
      return result;
    }
    catch (err) {
      console.log('Search : search.searchParks : Error encountered while making a search request to ElasticSearch.')
      throw err;
    }
  },

  parkAutocomplete: async ({
    searchText,
  }) => {

    if (!searchText) {
      return [];
    }

    let textFilter = [];

    let filtersForLongerQueries = [];

    if (searchText.length > 2) {
      filtersForLongerQueries = [
        {
          match_phrase_prefix: {
            nameLowerCase: {
              query: searchText,
              boost: 4
            }
          }
        },
        {
          match_phrase_prefix: {
            parkNames: {
              query: searchText,
              boost: 4
            }
          }
        },
        {
          multi_match: {
            query: searchText,
            fuzziness: "AUTO",
            type: "best_fields",
            fields: ["parkNames^2", "protectedAreaName^5"],
            operator: "or"
          }
        }];
    }

    if (searchText) {
      textFilter = [
        {
          prefix: {
            "nameLowerCase.keyword": {
              value: searchText.toLowerCase(),
              boost: 6
            }
          }
        },
        {
          prefix: {
            "parkNames.keyword": {
              value: searchText.toLowerCase(),
              boost: 3
            }
          }
        },
        ...filtersForLongerQueries
      ];
    }

    try {
      const query = {
        index: getIndexName(),
        filterPath: "hits.hits._source",
        body: {
          from: 0,
          size: 10,
          query: {
            bool: {
              should: [...textFilter]
            }
          }
        },
        sort: [
          "typeCode.keyword:desc",
          "_score",
          "nameLowerCase.keyword"
        ],
        _source: [
          "protectedAreaName",
          "slug"
        ]
      };
      const result = await doElasticSearch(query);
      return result;
    }
    catch (err) {
      console.log('Search : search.parkAutocomplete : Error encountered while making a search request to ElasticSearch.')
      throw err;
    }
  },
});

const getIndexName = () => {
  return `${process.env.ELASTIC_PARK_INDEX_NAME}-${process.env.STRAPI_ADMIN_ENVIRONMENT || 'local'}`;
}
