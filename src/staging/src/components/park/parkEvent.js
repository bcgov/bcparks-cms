import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Avatar, Card, CardHeader } from "@material-ui/core"
import alertIcon from "../../images/park/red-alert.png"
import { Link } from "gatsby"

const useStyles = makeStyles({
  card: {
    border: "none",
    boxShadow: "none",
    backgroundColor: "#e1ecf4",
  },
  topGrid: {
    backgroundColor: "#e1ecf4",
  },
})

export default function ParkEvent({ data }) {
  const classes = useStyles()

  if (!data) return null
  const parkEvents = data.nodes.filter(f => f.eventType != null)
  if (parkEvents.length === 0) return null

  return (
    <>
      <Grid item xs={12} sm={6} md={4} className={classes.topGrid}>
        <Card className={classes.card}>
          <CardHeader
            avatar={
              <Avatar
                variant="square"
                src={alertIcon}
                aria-label="park access status"
              />
            }
            title={
              <Link to="#park-alerts">
                {`Alerts currently in effect (${parkEvents.length})`}
              </Link>
            }
          />
        </Card>
      </Grid>
    </>
  )
}
