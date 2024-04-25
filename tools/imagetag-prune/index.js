"use strict";

const ImagePruner = require("./imagePruner");

const OPENSHIFT_AUTH_TOKEN = process.env.OPENSHIFT_AUTH_TOKEN;
const OPENSHIFT_API_URL =
  process.env.OPENSHIFT_API_URL ||
  "https://api.gold.devops.gov.bc.ca:6443/apis/image.openshift.io/v1";
const TOOLS_NAMESPACE = process.env.TOOLS_NAMESPACE || "c1643c-tools";

// Regex pattern used to match git sha hash abcd345
const GIT_SHA_HASH_REGEX =
  process.env.GIT_SHA_HASH_REGEX || "\\b[0-9a-f]{7}\\b";

  // Regex pattern used to match release tags, e.g., v1.12.3
const RELEASE_TAG_REGEX =
  process.env.RELEASE_TAG_REGEX || "^v[0-9]*\\.[0-9]*\\.[0-9]*-?.*";

const IMAGETAGS_TO_KEEP = splitAndTrim(process.env.IMAGETAGS_TO_KEEP) || [
  "latest",
  "dev",
  "test",
  "prod",
];
const IMAGESTRAMS_TO_CLEAN = splitAndTrim(process.env.IMAGESTRAMS_TO_CLEAN) || [
  "admin-alpha",
  "admin-main",
  "etl-alpha",
  "etl-main",
  "maintenance-alpha",
  "maintenance-main",
  "public-builder-alpha",
  "public-builder-main",
  "public-alpha",
  "public-main",
  "strapi-alpha",
  "strapi-main",
  "scheduler-main",
  "scheduler-alpha"
];

// Always keep the last "NUM_RELEASES_TO_KEEP" tags
const NUM_RELEASES_TO_KEEP = process.env.NUM_RELEASES_TO_KEEP || 10;

const DRY_RUN = process.env.DRY_RUN !== "false";

function splitAndTrim(str) {
  if (str) {
    return str.split(",").map((item) => item.trim());
  }

  return str;
}

const pruner = new ImagePruner({
  openShiftUrl: `${OPENSHIFT_API_URL}/namespaces/${TOOLS_NAMESPACE}/imagestreamtags`,
  openShiftToken: OPENSHIFT_AUTH_TOKEN,
  releaseTagRegex: RELEASE_TAG_REGEX,
  gitShaHashRegex: GIT_SHA_HASH_REGEX,
  imageStreamsToPrune: IMAGESTRAMS_TO_CLEAN,
  imageTagsToIgnore: IMAGETAGS_TO_KEEP,
  numReleasesToKeep: NUM_RELEASES_TO_KEEP,
  dryRun: DRY_RUN,
});

pruner.prune();
