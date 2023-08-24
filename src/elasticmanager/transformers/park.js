const axios = require("axios");

/**
 * Transforms a protectedArea retrieved from Strapi into a JSON format
 * that is optimized for Elasticsearch
 */

exports.createElasticPark = async function (park, photos) {
  if (!park || !park.isDisplayed || !park.publishedAt) {
    return null;
  }

  // convert marineProtectedArea to bool
  park.marineProtectedArea = park.marineProtectedArea === 'Y';

  // get photos
  park.parkPhotos = photos.filter((p) => p.orcs === park.orcs)
    .sort((a, b) => { return a.sortOrder > b.sortOrder ? 1 : -1 })
    .slice(0, 5)
    .map(p => { return p.imageUrl });

  // convert managementAreas to parkLocations
  park.parkLocations = [];
  if (park?.managementAreas?.length) {
    for (const ma of park.managementAreas) {
      park.parkLocations.push({
        regionNum: ma.section?.region?.regionNumber,
        region: ma.section?.region?.regionName,
        sectionNum: ma.section?.sectionNumber,
        section: ma.section?.sectionName,
        managementAreaNum: ma.managementAreaNumber,
        managementArea: ma.managementAreaName
      });
    }
  }
  delete park.managementAreas;

  // convert parkNames
  if (park.parkNames?.length) {
    let parkNames = park.parkNames
      .filter(n => n.parkNameType?.nameTypeId !== 2)
      .map(n => {
        return n.parkName.toLowerCase();
      });
    park.parkNames = [...new Set(parkNames || [])];
  }

  // store protectedAreaName as lowercase for sorting
  park.nameLowerCase = park.protectedAreaName.toLowerCase();

  // convert parkFacilities
  park.hasCamping = false;
  park.campingFacilities = [];
  if (park?.parkFacilities?.length) {
    const parkFacilities = park.parkFacilities
      .filter(f => {
        return f.isActive && f.facilityType?.isActive && !f.facilityType.isCamping;
      })
      .map(f => {
        return {
          code: f.facilityType.facilityCode,
          num: f.facilityType.facilityNumber
        };
      });

    park.campingFacilities = park.parkFacilities
      .filter(f => {
        return f.isActive && f.facilityType?.isActive && f.facilityType.isCamping;
      })
      .map(f => {
        park.hasCamping = true;
        return {
          code: f.facilityType.facilityCode,
          num: f.facilityType.facilityNumber
        };
      });

    park.parkFacilities = parkFacilities;
  }

  // convert parkActivities
  if (park?.parkActivities?.length) {
    park.parkActivities = park.parkActivities
      .filter(a => {
        return a.isActive && a.activityType?.isActive;
      })
      .map(a => {
        return {
          code: a.activityType.activityCode,
          num: a.activityType.activityNumber
        };
      });
  }

  // convert publicAdvisories
  park.advisories = [];
  if (park?.publicAdvisories?.length) {
    const publicAdvisories = park.publicAdvisories
      .filter(a => {
        return a.advisoryStatus.code === "PUB";
      })
      .map(a => {
        return {
          id: a.id,
          urgencyId: a.urgency?.id,
          advisoryStatusId: a.advisoryStatus?.id,
          accessStatusId: a.accessStatus?.id
        };
      });
    park.advisories = publicAdvisories;
  }
  delete park.publicAdvisories;

  // add geo info
  if (park.latitude && park.longitude) {
    park.locationGeo = [`${park.latitude},${park.longitude}`];
  }

  // delete fields that are only used for indexing
  delete park.isDisplayed;
  delete park.publishedAt;
  delete park.latitude;
  delete park.longitude;

  return park;
};
