import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardHeader, Avatar } from "@material-ui/core"
import accessibilityIcon from "../../images/park/accessibility.png"

const useStyles = makeStyles({
  card: {
    border: "none",
    boxShadow: "none",
  },
})

export default function Accessibility({ data }) {
  const classes = useStyles()

  return (
    <>
      <Grid container item xs={12} sm={6} md={4}>
        <Card className={classes.card}>
          <CardHeader
            avatar={
              <Avatar
                variant="square"
                src={accessibilityIcon}
                aria-label="accessibility"
              />
            }
            title="Accessibility"
          />
        </Card>
      </Grid>
    </>
  )
}
