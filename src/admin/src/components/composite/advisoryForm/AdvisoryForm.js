import React, { useState } from "react";
import PropTypes from "prop-types";
import "./AdvisoryForm.css";
import { Button } from "../../shared/button/Button";
import {
  TextField,
  ButtonGroup,
  Radio,
  Checkbox,
  FormControl,
  FormHelperText,
  Button as Btn
} from "@material-ui/core";
import MomentUtils from "@date-io/moment";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import Select from "react-select";
import WarningIcon from "@material-ui/icons/Warning";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import HelpIcon from "@material-ui/icons/Help";
import VisibilityToggle from "../../base/visibilityToggle/VisibilityToggle";
import {
  validateOptionalNumber,
  validateRequiredText,
  validateRequiredSelect,
  validateRequiredLocation,
  validateRequiredDate,
  validateOptionalDate,
  validAdvisoryData,
} from "../../../validators/AdvisoryValidator";

import PrivateElement from "../../../auth/PrivateElement";
import AdvisoryHistory from "../advisoryHistory/AdvisoryHistory";
import LightTooltip from "../../shared/tooltip/LightTooltip";

export default function AdvisoryForm({
  mode,
  data: {
    advisoryNumber,
    revisionNumber,
    ticketNumber,
    setTicketNumber,
    listingRank,
    setListingRank,
    headline,
    setHeadline,
    eventType,
    eventTypes,
    setEventType,
    accessStatus,
    accessStatuses,
    setAccessStatus,
    description,
    setDescription,
    standardMessages,
    selectedStandardMessages,
    setSelectedStandardMessages,
    protectedAreas,
    selectedProtectedAreas,
    setSelectedProtectedAreas,
    regions,
    selectedRegions,
    setSelectedRegions,
    sections,
    selectedSections,
    setSelectedSections,
    managementAreas,
    selectedManagementAreas,
    setSelectedManagementAreas,
    sites,
    selectedSites,
    setSelectedSites,
    fireCentres,
    selectedFireCentres,
    setSelectedFireCentres,
    fireZones,
    selectedFireZones,
    setSelectedFireZones,
    urgencies,
    urgency,
    setUrgency,
    isSafetyRelated,
    setIsSafetyRelated,
    isReservationAffected,
    setIsReservationAffected,
    advisoryDate,
    handleAdvisoryDateChange,
    displayAdvisoryDate,
    setDisplayAdvisoryDate,
    startDate,
    setStartDate,
    displayStartDate,
    setDisplayStartDate,
    endDate,
    setEndDate,
    displayEndDate,
    setDisplayEndDate,
    updatedDate,
    setUpdatedDate,
    displayUpdatedDate,
    setDisplayUpdatedDate,
    expiryDate,
    setExpiryDate,
    handleDurationIntervalChange,
    handleDurationUnitChange,
    linksRef,
    linkTypes,
    removeLink,
    updateLink,
    addLink,
    handleFileCapture,
    notes,
    setNotes,
    submittedBy,
    setSubmittedBy,
    advisoryStatuses,
    advisoryStatus,
    setAdvisoryStatus,
    isStatHoliday,
    isAfterHours,
    isAfterHourPublish,
    setIsAfterHourPublish,
    saveAdvisory,
    isSubmitting,
    isSavingDraft,
    updateAdvisory,
    setToBack,
    formError,
    setFormError,
  },
}) {
  const [protectedAreaError, setProtectedAreaError] = useState("");
  const [eventTypeError, setEventTypeError] = useState("");
  const [urgencyError, setUrgencyError] = useState("");
  const [advisoryStatusError, setAdvisoryStatusError] = useState("");
  const [ticketNumberError, setTicketNumberError] = useState("");
  const [headlineError, setHeadlineError] = useState("");
  const [advisoryDateError, setAdvisoryDateError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [expiryDateError, setExpiryDateError] = useState("");
  const [updatedDateError, setUpdatedDateError] = useState("");
  const [submittedByError, setSubmittedByError] = useState("");
  const [listingRankError, setListingRankError] = useState("");

  const advisoryData = {
    listingRank: { value: listingRank, setError: setListingRankError, text: "listing rank" },
    ticketNumber: { value: ticketNumber, setError: setTicketNumberError },
    headline: { value: headline, setError: setHeadlineError, text: "headline" },
    eventType: {
      value: eventType,
      setError: setEventTypeError,
      text: "event type",
    },
    protectedArea: {
      value: [
        selectedProtectedAreas,
        selectedRegions,
        selectedSections,
        selectedManagementAreas,
        selectedFireCentres,
        selectedFireZones,
        selectedSites,
      ],
      setError: setProtectedAreaError,
      text: "at least one affected area",
    },
    urgency: { value: urgency, setError: setUrgencyError, text: "urgency" },
    advisoryDate: { value: advisoryDate, setError: setAdvisoryDateError },
    startDate: { value: startDate, setError: setStartDateError },
    endDate: { value: endDate, setError: setEndDateError },
    expiryDate: { value: expiryDate, setError: setExpiryDateError },
    updatedDate: { value: updatedDate, setError: setUpdatedDateError },
    submittedBy: {
      value: submittedBy,
      setError: setSubmittedByError,
      text: "submitted by",
    },
    advisoryStatus: {
      value: advisoryStatus,
      setError: setAdvisoryStatusError,
      text: "advisory status",
    },
    formError: setFormError,
  };

  const headlineInput = {
    id: "headline",
    required: false,
    placeholder: "Advisory Headline",
  };
  const descriptionInput = {
    id: "description",
    required: true,
    placeholder: "Description of advisory",
  };
  const linkTitleInput = {
    id: "link",
    required: false,
    placeholder: "Link Title",
  };
  const linkUrlInput = {
    id: "url",
    required: false,
    placeholder: "URL",
  };
  const notesInput = {
    id: "notes",
    required: false,
    placeholder: "Notes",
  };

  const submitterInput = {
    id: "submitter",
    required: false,
    placeholder: "Advisory Submitted by",
  };

  const ticketNumberInput = {
    id: "ticketNumber",
    required: false,
    placeholder: "Discover Camping Ticket Number",
  };

  const listingRankInput = {
    id: "listing",
    required: true,
    placeholder: "Listing Rank",
  };

  const intervals = [
    { label: "Two", value: 2 },
    { label: "Three", value: 3 },
    { label: "Four", value: 4 },
    { label: "Five", value: 5 },
  ];

  // Moment Intervals ref: https://momentjscom.readthedocs.io/en/latest/moment/03-manipulating/01-add/
  const intervalUnits = [
    { label: "Hours", value: "h" },
    { label: "Days", value: "d" },
    { label: "Weeks", value: "w" },
    { label: "Months", value: "M" },
  ];

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <form>
        <div className="container-fluid ad-form">
          {advisoryNumber && (
            <>
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
                  Advisory Number
                </div>
                <div className="col-lg-7 col-md-8 col-sm-12">
                  <TextField
                    value={advisoryNumber}
                    className="bcgov-input ad-disabled"
                    variant="outlined"
                    disabled
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
                  Revision Number
                </div>
                <div className="col-lg-7 col-md-8 col-sm-12">
                  <TextField
                    value={revisionNumber}
                    className="bcgov-input ad-disabled"
                    variant="outlined"
                    disabled
                  />
                </div>
              </div>
            </>
          )}
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label bcgov-required">
              Headline
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <TextField
                value={headline}
                onChange={(event) => {
                  setHeadline(event.target.value);
                }}
                className="bcgov-input"
                variant="outlined"
                inputProps={{ maxLength: 255 }}
                InputProps={{ ...headlineInput }}
                error={headlineError !== ""}
                helperText={headlineError}
                onBlur={() => {
                  validateRequiredText(advisoryData.headline);
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label bcgov-required">
              Event Type
              <LightTooltip
                arrow
                title="Please select the most appropriate event type that your advisory falls under, this does impact the front-end. 
                For example, freshet and wildfire event types load conditional content to their respective flood and wildfire pages."
              >
                <HelpIcon className="helpIcon" />
              </LightTooltip>
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  eventTypeError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={eventTypes}
                  value={eventTypes.filter((e) => e.value === eventType)}
                  onChange={(e) => setEventType(e ? e.value : 0)}
                  placeholder="Select an event type"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredSelect(advisoryData.eventType);
                  }}
                  isClearable
                />
                <FormHelperText>{eventTypeError}</FormHelperText>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Park Access Status
              <LightTooltip
                arrow
                title="This applies any applicable symbols or icons relating to the park access status to the advisory.
                Such as full closure or partial closure icons."
              >
                <HelpIcon className="helpIcon" />
              </LightTooltip>
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <Select
                options={accessStatuses}
                value={accessStatuses.filter((e) => e.value === accessStatus)}
                onChange={(e) => setAccessStatus(e ? e.value : 0)}
                placeholder="Select an access status"
                className="bcgov-select"
                isClearable
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label bcgov-required">
              Urgency Level
              <LightTooltip
                arrow
                title="Dependant on your advisory, the urgency level can be used to prioritize your alert above existing alerts for the same park page.
                Ie, assigning a high urgency re wildfire closure will place that advisory at the top."
              >
                <HelpIcon className="helpIcon" />
              </LightTooltip>
            </div>
            <div className="col-lg-8 col-md-8 col-sm-12">
              <FormControl error>
                <ButtonGroup
                  className="ad-btn-group"
                  color="primary"
                  aria-label="outlined primary button group"
                >
                  {urgencies.map((u) => (
                    <Button
                      key={u.value}
                      label={u.label}
                      styling={
                        urgency === u.value
                          ? "bcgov-normal-blue btn"
                          : "bcgov-normal-white btn"
                      }
                      onClick={() => {
                        setUrgency(u.value);
                      }}
                    />
                  ))}
                </ButtonGroup>
                <FormHelperText>{urgencyError}</FormHelperText>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-6 col-6 ad-label">
              Safety Related
            </div>
            <div className="col-lg-8 col-md-8 col-sm-6 col-6">
              <Checkbox
                checked={isSafetyRelated}
                onChange={(e) => {
                  setIsSafetyRelated(e.target.checked);
                }}
                inputProps={{ "aria-label": "safety related" }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Description
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <TextField
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
                multiline
                rows={2}
                rowsMax={10}
                className="bcgov-input"
                variant="outlined"
                InputProps={{ ...descriptionInput }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Standard Message(s)
              <LightTooltip
                arrow
                title="Standard messages are chosen from a list of generic, pre-defined and approved messages. 
                This content will be added below any text entered in the description on the park page.
                There is no requirement to have both a description and standard messaging."
              >
                <HelpIcon className="helpIcon" />
              </LightTooltip>
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <Select
                options={standardMessages}
                value={selectedStandardMessages}
                onChange={(e) => {
                  setSelectedStandardMessages(e);
                }}
                placeholder="Add standard message"
                className="bcgov-select"
                isMulti
                isClearable
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12  bcgov-required ad-label">
              Select at least one affected area:
              <LightTooltip
                arrow
                title="Please select the park that your advisory is affecting.
                There is no need to select additional sites, regions, or sections if your advisory is just for a specific park.
                Selecting a region (or any other category) will apply your advisory to every park page within that region or other category.              
                For example, an advisory for Goldstream Park would only need Goldstream selected from the list of parks,
                you would not need to include West Coast in the regions as this would trigger an alert for all parks in the West Coast."
              >
                <HelpIcon className="helpIcon" />
              </LightTooltip>
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <FormHelperText>{protectedAreaError}</FormHelperText>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">Park(s)</div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={protectedAreas}
                  value={selectedProtectedAreas}
                  onChange={(e) => {
                    setSelectedProtectedAreas(e);
                  }}
                  placeholder="Select a Park"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">Site(s)</div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={sites}
                  value={selectedSites}
                  onChange={(e) => {
                    setSelectedSites(e);
                  }}
                  placeholder="Select a Site"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Region(s)
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={regions}
                  value={selectedRegions}
                  onChange={(e) => {
                    setSelectedRegions(e);
                  }}
                  placeholder="Select a Region"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Section(s)
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={sections}
                  value={selectedSections}
                  onChange={(e) => {
                    setSelectedSections(e);
                  }}
                  placeholder="Select a Section"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Management Area(s)
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={managementAreas}
                  value={selectedManagementAreas}
                  onChange={(e) => {
                    setSelectedManagementAreas(e);
                  }}
                  placeholder="Select a Management Area"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Fire Centre(s)
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={fireCentres}
                  value={selectedFireCentres}
                  onChange={(e) => {
                    setSelectedFireCentres(e);
                  }}
                  placeholder="Select a Fire Centre"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Fire Zone(s)
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <FormControl
                variant="outlined"
                className={`bcgov-select-form ${
                  protectedAreaError !== "" ? "bcgov-select-error" : ""
                }`}
                error
              >
                <Select
                  options={fireZones}
                  value={selectedFireZones}
                  onChange={(e) => {
                    setSelectedFireZones(e);
                  }}
                  placeholder="Select a Fire Zone"
                  isMulti="true"
                  className="bcgov-select"
                  onBlur={() => {
                    validateRequiredLocation(advisoryData.protectedArea);
                  }}
                />
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-6 col-6 ad-label">
              Reservations Affected
            </div>
            <div className="col-lg-8 col-md-8 col-sm-6 col-6">
              <Checkbox
                checked={isReservationAffected}
                onChange={(e) => {
                  setIsReservationAffected(e.target.checked);
                }}
                inputProps={{
                  "aria-label": "Discover camping affected",
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              DC Ticket Number
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <TextField
                value={ticketNumber}
                onChange={(event) => {
                  setTicketNumber(event.target.value);
                }}
                className="bcgov-input"
                variant="outlined"
                InputProps={{ ...ticketNumberInput }}
                error={ticketNumberError !== ""}
                helperText={ticketNumberError}
                onBlur={() => {
                  validateOptionalNumber(advisoryData.ticketNumber);
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Listing Rank
              <LightTooltip
                arrow
                title="Advisories, by default, are listed by date in descending order. 
                Listing Rank is a number that is used to override the chronological sort order for advisories. 
                A higher listing rank number will give the advisory a higher priority in the list."
              >
                <HelpIcon className="helpIcon" />
              </LightTooltip>
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <TextField
                value={listingRank}
                onChange={(event) => {
                  setListingRank(event.target.value);
                }}
                className="bcgov-input"
                variant="outlined"
                InputProps={{ ...listingRankInput }}
                error={listingRankError !== ""}
                helperText={listingRankError}
                onBlur={() => {
                  validateOptionalNumber(advisoryData.listingRank);
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Effective date
            </div>
            <div className="col-lg-8 col-md-8 col-sm-12">
              <div className="field-bg-blue">
                <div className="ad-field ad-flex-wrap ad-flex">
                  <div className="col-lg-8 col-md-12 col-sm-12">
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 plr0">
                        <div className="ad-flex">
                          <div className="p10 col-lg-3 col-md-3 col-sm-12 ad-date-label bcgov-required">
                            Advisory Date
                          </div>
                          <div className="col-lg-9 col-md-9 col-sm-12 ad-flex-date">
                            <KeyboardDateTimePicker
                              id="advisoryDate"
                              value={advisoryDate}
                              onChange={handleAdvisoryDateChange}
                              format="MMMM DD, yyyy hh:mm A"
                              className={`bcgov-datepicker-wrapper ${
                                advisoryDateError !== ""
                                  ? "bcgov-datepicker-wrapper-error"
                                  : ""
                              }`}
                              error={advisoryDateError !== ""}
                              helperText={advisoryDateError}
                              onBlur={() => {
                                validateRequiredDate(advisoryData.advisoryDate);
                              }}
                            />
                            <VisibilityToggle
                              toggle={{
                                toggleState: displayAdvisoryDate,
                                setToggleState: setDisplayAdvisoryDate,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 plr0">
                        <div className="ad-flex">
                          <div className="p10 col-lg-3 col-md-3 col-sm-12 ad-date-label">
                            Start Date
                          </div>
                          <div className="col-lg-9 col-md-9 col-sm-12 ad-flex-date">
                            <KeyboardDateTimePicker
                              id="startDate"
                              value={startDate}
                              onChange={setStartDate}
                              format="MMMM DD, yyyy hh:mm A"
                              className={`bcgov-datepicker-wrapper ${
                                startDateError !== ""
                                  ? "bcgov-datepicker-wrapper-error"
                                  : ""
                              }`}
                              error={startDateError !== ""}
                              helperText={startDateError}
                              onBlur={() => {
                                validateOptionalDate(advisoryData.startDate);
                              }}
                            />
                            <VisibilityToggle
                              toggle={{
                                toggleState: displayStartDate,
                                setToggleState: setDisplayStartDate,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 plr0">
                        <div className="ad-flex">
                          <div className="p10 col-lg-3 col-md-3 col-sm-12 ad-date-label">
                            End Date
                          </div>
                          <div className="col-lg-9 col-md-9 col-sm-12 ad-flex-date">
                            <KeyboardDateTimePicker
                              id="endDate"
                              value={endDate}
                              onChange={setEndDate}
                              format="MMMM DD, yyyy hh:mm A"
                              className={`bcgov-datepicker-wrapper ${
                                endDateError !== ""
                                  ? "bcgov-datepicker-wrapper-error"
                                  : ""
                              }`}
                              error={endDateError !== ""}
                              helperText={endDateError}
                              onBlur={() => {
                                validateOptionalDate(advisoryData.endDate);
                              }}
                              minDate={startDate}
                              minDateMessage="End date should not be before Advisory date"
                            />
                            <VisibilityToggle
                              toggle={{
                                toggleState: displayEndDate,
                                setToggleState: setDisplayEndDate,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {mode === "update" && (
                      <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 plr0">
                          <div className="ad-flex">
                            <div className="p10 col-lg-3 col-md-3 col-sm-12 ad-date-label">
                              Updated Date
                            </div>
                            <div className="col-lg-9 col-md-9 col-sm-12 ad-flex-date">
                              <KeyboardDateTimePicker
                                id="updatedDate"
                                value={updatedDate}
                                onChange={setUpdatedDate}
                                format="MMMM DD, yyyy hh:mm A"
                                className={`bcgov-datepicker-wrapper ${
                                  updatedDateError !== ""
                                    ? "bcgov-datepicker-wrapper-error"
                                    : ""
                                }`}
                                error={updatedDateError !== ""}
                                helperText={updatedDateError}
                                onBlur={() => {
                                  validateOptionalDate(
                                    advisoryData.updatedDate
                                  );
                                }}
                              />
                              <VisibilityToggle
                                toggle={{
                                  toggleState: displayUpdatedDate,
                                  setToggleState: setDisplayUpdatedDate,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 plr0">
                        <div className="ad-flex">
                          <div className="p10 col-lg-3 col-md-3 col-sm-12 ad-date-label">
                            Expiry Date
                          </div>
                          <div className="col-lg-9 col-md-9 col-sm-12 ad-flex-date">
                            <KeyboardDateTimePicker
                              id="expiryDate"
                              value={expiryDate}
                              onChange={setExpiryDate}
                              format="MMMM DD, yyyy hh:mm A"
                              className={`bcgov-datepicker-wrapper  mr40 ${
                                expiryDateError !== ""
                                  ? "bcgov-datepicker-wrapper-error"
                                  : ""
                              }`}
                              error={expiryDateError !== ""}
                              helperText={expiryDateError}
                              onBlur={() => {
                                validateOptionalDate(advisoryData.expiryDate);
                              }}
                              minDate={startDate}
                              minDateMessage="Expiry date should not be before Advisory date"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12 col-sm-12 plr0 ad-auto-margin">
                    <div className="ad-flex">
                      <div className="p10 col-lg-4 col-md-3 col-sm-12 ad-duration-label">
                        Duration
                      </div>
                      <div className="p10 ml15 col-lg-8 col-md-6 col-sm-8 col-8 pt3 ad-interval-box">
                        <Select
                          options={intervals}
                          onChange={handleDurationIntervalChange}
                          placeholder="Select"
                          className="pbm3 ad-interval-select bcgov-select"
                        />
                        <Select
                          options={intervalUnits}
                          onChange={handleDurationUnitChange}
                          placeholder="Select"
                          className="ad-interval-select bcgov-select"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">Links</div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              {linksRef.current.map((l, idx) => (
                <div key={idx}>
                  <div className="ad-link-flex">
                    <Select
                      options={linkTypes}
                      onChange={(e) => {
                        updateLink(idx, "type", e.value);
                      }}
                      value={linkTypes.filter((o) => o.value === l.type)}
                      className="ad-link-select bcgov-select"
                      placeholder="Select a link type"
                    />
                    <div
                      className="ad-link-close ad-add-link pointer div-btn "
                      tabIndex="0"
                      onClick={() => {
                        removeLink(idx);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          removeLink(idx);
                        }
                      }}
                    >
                      <CloseIcon />
                    </div>
                  </div>
                  <div className="ad-link-group">
                    <TextField
                      value={l.title}
                      onChange={(event) => {
                        updateLink(idx, "title", event.target.value);
                      }}
                      className="bcgov-input"
                      variant="outlined"
                      InputProps={{ ...linkTitleInput }}
                      error={l.url !== "" && l.title === ""}
                      helperText={(l.url && !l.title) ? "Please enter link title too" : ""}
                    />
                    <TextField
                      value={l.file ? l.file.url : l.url}
                      onChange={(event) => {
                        updateLink(idx, "url", event.target.value);
                      }}
                      className="bcgov-input"
                      variant="outlined"
                      InputProps={{ ...linkUrlInput }}
                      error={l.title !== "" && l.url === ""}
                      helperText={(l.title && !l.url) ? "Please enter URL too" : ""}
                    />
                    <div className="ad-flex">
                      <TextField
                        value={l.file ? l.file.name : ""}
                        className="bcgov-input mr10"
                        variant="outlined"
                        placeholder="Select files for upload"
                      />
                      <Btn
                        variant="contained"
                        component="label"
                        className="bcgov-normal-blue btn transform-none ad-upload-btn"
                      >
                        Browse
                        <input
                          type="file"
                          accept=".jpg,.gif,.png,.gif,.pdf"
                          hidden
                          onChange={({ target }) => {
                            handleFileCapture(target.files, idx);
                          }}
                        />
                      </Btn>
                    </div>
                  </div>
                </div>
              ))}
              <div
                tabIndex="0"
                className="ad-add-link pointer div-btn"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addLink();
                  }
                }}
                onClick={() => {
                  addLink();
                }}
              >
                <AddIcon />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-12 ad-label">
              Internal Notes
            </div>
            <div className="col-lg-7 col-md-8 col-sm-12">
              <TextField
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                }}
                className="bcgov-input"
                variant="outlined"
                InputProps={{ ...notesInput }}
              />
            </div>
          </div>
          {PrivateElement(["approver"]) && (
            <>
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-12 ad-label bcgov-required">
                  Submitted By
                </div>
                <div className="col-lg-7 col-md-8 col-sm-12">
                  <TextField
                    value={submittedBy}
                    onChange={(event) => {
                      setSubmittedBy(event.target.value);
                    }}
                    className="bcgov-input"
                    variant="outlined"
                    InputProps={{ ...submitterInput }}
                    error={submittedByError !== ""}
                    helperText={submittedByError}
                    onBlur={() => {
                      validateRequiredText(advisoryData.submittedBy);
                    }}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-12 ad-label bcgov-required">
                  Advisory Status
                </div>
                <div className="col-lg-7 col-md-8 col-sm-12">
                  <FormControl
                    variant="outlined"
                    className={`bcgov-select-form ${
                      advisoryStatusError !== "" ? "bcgov-select-error" : ""
                    }`}
                    error
                  >
                    <Select
                      options={advisoryStatuses}
                      value={advisoryStatuses.filter(
                        (a) => a.value === advisoryStatus
                      )}
                      onChange={(e) => setAdvisoryStatus(e ? e.value : 0)}
                      placeholder="Select an advisory status"
                      className="bcgov-select"
                      onBlur={() => {
                        validateRequiredSelect(advisoryData.advisoryStatus);
                      }}
                      isClearable
                    />
                    <FormHelperText>{advisoryStatusError}</FormHelperText>
                  </FormControl>
                </div>
              </div>
            </>
          )}
          {!PrivateElement(["approver"]) && (isStatHoliday || isAfterHours) && (
            <div className="ad-af-hour-box">
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-1 col-1 ad-label">
                  <WarningIcon className="warningIcon" />
                </div>
                <div className="col-lg-8 col-md-8 col-sm-11 col-11">
                  <p>
                    <b>
                      This is an after-hours advisory. <br />
                      The web team business hours are Monday to Friday,
                      8:30AM–4:30PM
                    </b>
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-1 col-1 ad-label">
                  <Radio
                    checked={isAfterHourPublish}
                    onChange={() => {
                      setIsAfterHourPublish(true);
                    }}
                    value="Publish"
                    name="after-hour-submission"
                    inputProps={{ "aria-label": "Publish immediately" }}
                  />
                </div>
                <div className="col-lg-8 col-md-8 col-sm-11 col-11">
                  <p>Advisory is urgent/safety-related. Publish immediately.</p>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-1 col-1 ad-label">
                  <Radio
                    checked={!isAfterHourPublish}
                    onChange={() => {
                      setIsAfterHourPublish(false);
                    }}
                    value="Review"
                    name="after-hour-submission"
                    inputProps={{
                      "aria-label": "Submit for web team review",
                    }}
                  />
                </div>
                <div className="col-lg-8 col-md-8 col-sm-11 col-11">
                  <p>Advisory is not urgent. Submit for web team review.</p>
                </div>
              </div>
            </div>
          )}
          <br />
          <div className="row">
            <div className="col-lg-4 col-md-4"></div>
            <div className="col-lg-7 col-md-8 col-sm-12 ad-form-error">
              <FormControl error>
                <FormHelperText>{formError}</FormHelperText>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-4"></div>
            <div className="col-lg-7 col-md-8 col-sm-12 button-row ad-btn-group">
              {!PrivateElement(["approver"]) && (
                <>
                  {mode === "create" && (
                    <>
                      <Button
                        label="Submit"
                        styling="bcgov-normal-blue btn"
                        onClick={() => {
                          if (validAdvisoryData(advisoryData, linksRef, false, mode)) {
                            saveAdvisory("submit");
                          }
                        }}
                        hasLoader={isSubmitting}
                      />
                      <Button
                        label="Save Draft"
                        styling="bcgov-normal-light btn"
                        onClick={() => {
                          if (validAdvisoryData(advisoryData, linksRef, false, mode)) {
                            saveAdvisory("draft");
                          }
                        }}
                        hasLoader={isSavingDraft}
                      />
                    </>
                  )}
                  {mode === "update" && (
                    <>
                      <Button
                        label="Submit"
                        styling="bcgov-normal-blue btn"
                        onClick={() => {
                          if (validAdvisoryData(advisoryData, linksRef, false, mode)) {
                            updateAdvisory("submit");
                          }
                        }}
                        hasLoader={isSubmitting}
                      />
                      <Button
                        label="Save Draft"
                        styling="bcgov-normal-light btn"
                        onClick={() => {
                          if (validAdvisoryData(advisoryData, linksRef, false, mode)) {
                            updateAdvisory("draft");
                          }
                        }}
                        hasLoader={isSavingDraft}
                      />
                    </>
                  )}
                  <Button
                    label="Cancel"
                    styling="bcgov-normal-light btn"
                    onClick={() => {
                      sessionStorage.clear();
                      setToBack();
                    }}
                  />
                </>
              )}
              {PrivateElement(["approver"]) && (
                <>
                  {mode === "create" && (
                    <Button
                      label="Create"
                      styling="bcgov-normal-blue btn"
                      onClick={() => {
                        if (validAdvisoryData(advisoryData, linksRef, true, mode)) {
                          saveAdvisory();
                        }
                      }}
                      hasLoader={isSubmitting}
                    />
                  )}
                  {mode === "update" && (
                    <Button
                      label="Update"
                      styling="bcgov-normal-blue btn"
                      onClick={() => {
                        if (validAdvisoryData(advisoryData, linksRef, true, mode)) {
                          updateAdvisory();
                        }
                      }}
                      hasLoader={isSubmitting}
                    />
                  )}
                  <Button
                    label="Cancel"
                    styling="bcgov-normal-light btn"
                    onClick={() => {
                      sessionStorage.clear();
                      setToBack();
                    }}
                  />
                </>
              )}
            </div>
          </div>
          <br />
          <br />
          <AdvisoryHistory data={{ advisoryNumber }} />
        </div>
      </form>
    </MuiPickersUtilsProvider>
  );
}

AdvisoryForm.propTypes = {
  mode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    advisoryNumber: PropTypes.number,
    revisionNumber: PropTypes.number,
    ticketNumber: PropTypes.string,
    setTicketNumber: PropTypes.func.isRequired,
    listingRank: PropTypes.number,
    setListingRank: PropTypes.func.isRequired,
    headline: PropTypes.string,
    setHeadline: PropTypes.func.isRequired,
    eventType: PropTypes.number,
    eventTypes: PropTypes.array.isRequired,
    setEventType: PropTypes.func.isRequired,
    accessStatus: PropTypes.number,
    accessStatuses: PropTypes.array.isRequired,
    setAccessStatus: PropTypes.func.isRequired,
    description: PropTypes.string,
    setDescription: PropTypes.func.isRequired,
    standardMessages: PropTypes.array.isRequired,
    selectedStandardMessages: PropTypes.array,
    setSelectedStandardMessages: PropTypes.func.isRequired,
    protectedAreas: PropTypes.array.isRequired,
    selectedProtectedAreas: PropTypes.array,
    setSelectedProtectedAreas: PropTypes.func.isRequired,
    regions: PropTypes.array.isRequired,
    selectedRegions: PropTypes.array,
    setSelectedRegions: PropTypes.func.isRequired,
    sections: PropTypes.array.isRequired,
    selectedSections: PropTypes.array,
    setSelectedSections: PropTypes.func.isRequired,
    managementAreas: PropTypes.array.isRequired,
    selectedManagementAreas: PropTypes.array,
    setSelectedManagementAreas: PropTypes.func.isRequired,
    sites: PropTypes.array.isRequired,
    selectedSites: PropTypes.array,
    setSelectedSites: PropTypes.func.isRequired,
    fireCentres: PropTypes.array.isRequired,
    selectedFireCentres: PropTypes.array,
    setSelectedFireCentres: PropTypes.func.isRequired,
    fireZones: PropTypes.array.isRequired,
    selectedFireZones: PropTypes.array,
    setSelectedFireZones: PropTypes.func.isRequired,
    urgencies: PropTypes.array.isRequired,
    urgency: PropTypes.number,
    setUrgency: PropTypes.func.isRequired,
    isSafetyRelated: PropTypes.bool,
    setIsSafetyRelated: PropTypes.func.isRequired,
    isReservationAffected: PropTypes.bool,
    setIsReservationAffected: PropTypes.func.isRequired,
    advisoryDate: PropTypes.object,
    handleAdvisoryDateChange: PropTypes.func.isRequired,
    displayAdvisoryDate: PropTypes.bool,
    setDisplayAdvisoryDate: PropTypes.func.isRequired,
    startDate: PropTypes.object,
    setStartDate: PropTypes.func.isRequired,
    displayStartDate: PropTypes.bool,
    setDisplayStartDate: PropTypes.func.isRequired,
    endDate: PropTypes.object,
    setEndDate: PropTypes.func.isRequired,
    displayEndDate: PropTypes.bool,
    setDisplayEndDate: PropTypes.func.isRequired,
    updatedDate: PropTypes.object,
    setUpdatedDate: PropTypes.func.isRequired,
    displayUpdatedDate: PropTypes.bool,
    setDisplayUpdatedDate: PropTypes.func.isRequired,
    expiryDate: PropTypes.object,
    setExpiryDate: PropTypes.func.isRequired,
    handleDurationIntervalChange: PropTypes.func.isRequired,
    handleDurationUnitChange: PropTypes.func.isRequired,
    linksRef: PropTypes.object.isRequired,
    linkTypes: PropTypes.array.isRequired,
    removeLink: PropTypes.func.isRequired,
    updateLink: PropTypes.func.isRequired,
    addLink: PropTypes.func.isRequired,
    handleFileCapture: PropTypes.func.isRequired,
    notes: PropTypes.string,
    setNotes: PropTypes.func.isRequired,
    submittedBy: PropTypes.string,
    setSubmittedBy: PropTypes.func.isRequired,
    advisoryStatuses: PropTypes.array.isRequired,
    advisoryStatus: PropTypes.number,
    setAdvisoryStatus: PropTypes.func.isRequired,
    isStatHoliday: PropTypes.bool,
    isAfterHours: PropTypes.bool,
    isAfterHourPublish: PropTypes.bool,
    setIsAfterHourPublish: PropTypes.func.isRequired,
    saveAdvisory: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
    isSavingDraft: PropTypes.bool,
    updateAdvisory: PropTypes.func.isRequired,
    setToBack: PropTypes.func.isRequired,
    formError: PropTypes.string,
    setFormError: PropTypes.func.isRequired,
  }).isRequired,
};
