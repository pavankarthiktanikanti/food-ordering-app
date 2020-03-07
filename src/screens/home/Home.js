import React, { Component } from "react";
import Header from '../../common/Header';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';

/**
 * Custom Styles used to customize material ui components
 * @param {*} theme
 */
const styles = theme => ({
    /** set the style for card text */
    cardText: {
        padding: '7%'
    },
    /** set the style for ctaegories dispalyed on a card */
    categories: {
        fontSize: 'large',
        marginTop: '1%'
    },
    /** set style for the image displayed on the card */
    image: {
        height: '200px',
        width: '500px'
    }
})

class Home extends Component {

    constructor() {
        super();
        this.state = {
            restaurants: [],
            search: ''
        }
    }

    /** this method will called before the components get mount */
    UNSAFE_componentWillMount() {
        let that = this;
        let xhrData = new XMLHttpRequest();
        let restaurants = null;
        xhrData.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                that.setState({
                    restaurants: JSON.parse(this.response).restaurants
                });
            }
        });
        xhrData.open("GET", this.props.baseUrl + '/restaurant');
        xhrData.send(restaurants);
    }

    /**
     * this method is used to search the restaurant according 
     * to restaurant name typed where 'searchValue' is the restaurant
     * name that needs to be searched
     */
    searchBoxChangeHandler = (searchValue) => {
        this.setState({ search: searchValue })
        //this will search restaurant ,if searchValue is non-empty
        if (searchValue !== '' && searchValue !== null) {
            let that = this;
            let xhrData = new XMLHttpRequest();
            let restaurants = null;
            xhrData.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    that.setState({
                        restaurants: JSON.parse(this.response).restaurants
                    });
                }
            });
            xhrData.open("GET", this.props.baseUrl + '/restaurant/name/' + searchValue);
            xhrData.send(restaurants);

        } else {
            this.UNSAFE_componentWillMount();
        }
    }

    render() {
        const { classes } = this.props;
        let rdata = this.state.restaurants;
        return (
            <div>
                <Header pageId='home' baseUrl={this.props.baseUrl} searchBoxChangeHandler={this.searchBoxChangeHandler} ></Header>
                <div className="home-container">
                    <GridList cellHeight={"auto"} cols={4}>
                        {rdata !== [] && rdata !== null && rdata.map(restaurant => (
                            <GridListTile key={restaurant.id}>
                                <Card variant="outlined">
                                    <CardActionArea>
                                        <CardContent>
                                            <div>
                                                <img src={restaurant.photo_URL} className={classes.image} alt={restaurant.id} />
                                            </div>
                                            <div className={classes.cardText}>
                                                <Typography gutterBottom variant="h4" component="h2">
                                                    {restaurant.restaurant_name}
                                                </Typography>
                                                <Typography variant="body2" component="p" className={classes.categories}>
                                                    {restaurant.categories}
                                                </Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </GridListTile>
                        ))}
                    </GridList>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(Home);