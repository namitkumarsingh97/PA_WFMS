import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";

const PostCards = (props) => {
  return (
    <Card
      sx={{
        display: "inline-block",
        minWidth: "450px",
        marginTop: "2%",
        marginLeft: "7%",
        height: "140px",
        backgroundColor: "#0e4959",
      }}
    >
      <CardActionArea>
        <CardContent>
          <CardMedia
            component="img"
            height="100"
            image={props.image}
            alt={props.alt}
            sx={{ width: "40%" }}
          />
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{
              position: "absolute",
              top: "40%",
              right: "10%",
              fontSize: "15px",
              wordWrap: "break-word",
              width: "120px",
              color: "#fff",
            }}
          >
            {props.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PostCards;
