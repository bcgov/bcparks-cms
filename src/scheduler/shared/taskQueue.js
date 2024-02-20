const { cmsAxios } = require("./axiosConfig");
const { getLogger } = require('./logging');
const qs = require('qs');

const readQueue = async function (actionName, options) {
  const sort = options?.descending ? "numericData:DESC" : "numericData";
  const query = qs.stringify({
    fields: ["numericData", "jsonData"],
    filters: {
      action: `${actionName}`
    },
    pagination: {
      limit: +process.env.BATCH_SIZE
    },
    sort: sort
  }, {
    encodeValuesOnly: true,
  })
  const queueResponse = await cmsAxios.get(`/api/queued-tasks?${query}`);
  const queuedTasks = queueResponse.data.data;
  if (queuedTasks.length > 0) {
    getLogger().info(`Got ${queuedTasks.length} "${actionName}" tasks from the queue`);
  }
  return queuedTasks;
}

const removeFromQueue = async function (queueIds) {
  if (queueIds?.length > 0) {
    try {
      const deleteQuery = "/api/queued-tasks/bulk-delete";
      await cmsAxios.post(deleteQuery, queueIds);
    } catch (error) {
      getLogger().error(error);
    }
  }
}

module.exports = {
  readQueue,
  removeFromQueue
}
