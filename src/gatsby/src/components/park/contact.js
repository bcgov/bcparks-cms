import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import HtmlContent from "./htmlContent"

// Helper function to get href prefix based on the contactType
const getPrefix = (contactType) => {
  switch (contactType) {
    case "Email":
      return "mailto:"
    case "Phone":
      return "tel:"
    default:
      return ""
  }
}
// Helper function to get the icon based on the contactType
const getIcon = (contactType) => {
  switch (contactType) {
    case "Email":
      return "envelope"
    case "Phone":
      return "phone"
    case "Website":
      return "laptop"
    case "Chat":
      return "messages"
    case "Facebook":
      return "facebook"
    case "Instagram":
      return "instagram"
    case "X-twitter":
      return "x-twitter"
    default:
      return ""
  }
}

export const ParkContact = ({ contact }) => {
  const parkOperatorContact = contact.parkOperatorContact
  const links = contact.contactInformation.length > 0 ? contact.contactInformation :
    parkOperatorContact.defaultContactInformation.length > 0 ? parkOperatorContact.defaultContactInformation : []

  return (
    <tr>
      <th>
        {contact.title ? contact.title : parkOperatorContact.defaultTitle}
      </th>
      <td>
        {(contact.description.data.description ||
          parkOperatorContact?.defaultDescription.data.defaultDescription) &&
          <HtmlContent>
            {contact.description.data.description ||
              parkOperatorContact.defaultDescription.data.defaultDescription}
          </HtmlContent>
        }
        {links.length > 0 && links.map((link, index) => (
          <p key={index}>
            <FontAwesomeIcon icon={`fa-regular fa-${getIcon(link.contactType)}`} />
            {link.contactUrl !== null ?
              <a href={`${getPrefix(link.contactType)}${link.contactUrl}`}>
                {link.contactText}
              </a>
              :
              link.contactText
            }
          </p>
        ))}
      </td>
    </tr>
  )
}

export default function Contact({ contact, parkContacts, operations }) {
  // Filter contacts by isActive and sort by rank
  const sortedContacts =
    parkContacts.filter(contact => contact.isActive).sort((a, b) => {
      return a.rank - b.rank
    })
  const hasAnyReservations =
    operations.hasCanoeCircuitReservations ||
    operations.hasPicnicShelterReservations ||
    operations.hasFrontcountryReservations ||
    operations.hasFrontcountryCabinReservations ||
    operations.hasBackcountryPermits ||
    operations.hasBackcountryReservations ||
    operations.hasBackcountryGroupReservations ||
    operations.hasBackcountryShelterReservations ||
    operations.hasBackcountryWildernessReservations

  return (
    <div id="contact" className="anchor-link">
      <h2 className="section-heading">Contact</h2>
      {sortedContacts.length > 0 ? (
        <figure class="table">
          <table>
            <tbody>
              {/* display it if hasAnyReservations is true  */}
              {hasAnyReservations && (
                <tr>
                  <th>Reservations, changes, and cancellations</th>
                  <td>
                    <p>
                      Our call centre is open from 7 am to 7 pm Pacific Time.
                      There is a $5 fee for reservations, changes, or cancellations made by phone.
                    </p>
                    <p>
                      <FontAwesomeIcon icon="fa-regular fa-phone" />
                      <a href="tel:1-800-689-9025">1-800-689-9025</a> (toll-free from Canada or the US)
                    </p>
                    <p>
                      <FontAwesomeIcon icon="fa-regular fa-phone" />
                      <a href="tel:1-519-858-6161">1-519-858-6161</a> (international)
                    </p>
                    <p>
                      <FontAwesomeIcon icon="fa-regular fa-laptop" />
                      <a href="https://camping.bcparks.ca/contact">Contact form</a>
                    </p>
                    <p>
                      <FontAwesomeIcon icon="fa-regular fa-messages" />
                      <a href="https://apps.cac1.pure.cloud/webchat/popup/#?locale=en-CA&webchatAppUrl=https%3A%2F%2Fapps.cac1.pure.cloud%2Fwebchat&webchatServiceUrl=https%3A%2F%2Frealtime.cac1.pure.cloud%3A443&logLevel=DEBUG&orgId=353&orgGuid=0b006318-4527-4b99-bcd7-c3b033bb5a7b&orgName=camis-caprod&queueName=BC_CHAT&waitForAllCandidates=true&forceRelayCandidates=false&cssClass=webchat-frame&css.width=100%25&css.height=100%25&companyLogo.url=https%3A%2F%2Fcamping.bcparks.ca%2Fimages%2Ffed25851-bc9a-4c9e-9d77-eef7d657e372.png&companyLogo.width=600&companyLogo.height=149&companyLogoSmall.url=https%3A%2F%2Fcamping.bcparks.ca%2Fimages%2Fc707917e-06eb-43b7-9037-167631c8075d.png&companyLogoSmall.width=25&companyLogoSmall.height=25&welcomeMessage=Welcome%20to%20the%20BC%20Parks%20Reservation%20Service%20chat.%20Agents%20are%20available%207%3A00%20am%20to%207%3A00%20pm%20PT.%20How%20may%20we%20help%20you%3F&agentAvatar.url=https%3A%2F%2Fcamping.bcparks.ca%2Fimages%2F530f022d-e797-4932-91c3-daca5905c3b8.png&agentAvatar.width=462&agentAvatar.height=462&onlineSchedules=%5Bobject%20Object%5D&chatNowElement=liveHelpContainer&widgetType=POPUP&webchatDeploymentKey=cd42d8bf-a796-41f3-8b20-be574ee3cdde&webchatApi=xmpp.v1">
                        Live chat
                      </a>
                    </p>
                  </td>
                </tr>
              )}
              {sortedContacts.map((contact, index) => (
                <ParkContact key={index} contact={contact} />
              ))}
              {/* display it always */}
              <tr>
                <th>General questions and feedback for BC Parks</th>
                <td>
                  <p>
                    We answer emails weekdays from 9 am to 5 pm Pacific Time.
                  </p>
                  <p>
                    <FontAwesomeIcon icon="fa-regular fa-envelope" />
                    <a href="mailto:parkinfo@gov.bc.ca">parkinfo@gov.bc.ca</a>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </figure>
      ) : (
        <HtmlContent>{contact}</HtmlContent>
      )}
    </div>
  )
}
