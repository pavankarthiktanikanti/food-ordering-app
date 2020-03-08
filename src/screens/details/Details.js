import { faCircle, faRupeeSign, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withStyles } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import React, { Component } from 'react';
import 'typeface-roboto';
import Header from '../../common/Header';
import './Details.css';

/**
 * Custom Styles used to customize material ui components
 * @param {*} theme
 */
const styles = theme => ({
    /* style the details of restaurant with top and bottom margin */
    detail: {
        margin: '2% 0%'
    },
    /* set font to bold */
    bold: {
        'font-weight': 600
    },
    /* Set the margin for category name */
    category: {
        marginBottom: '1%'
    },
    /* Set the margin for menu item */
    menuItem: {
        marginLeft: '2%'
    },
    /* Set the margin for the add icon (plus symbol) */
    addIcon: {
        marginLeft: '4%'
    }
});

class Details extends Component {
    constructor() {
        super();
        /**
         * Set the state with all the required fields and values
         */
        this.state = {
            isUserLoggedIn: sessionStorage.getItem('access-token') != null,
            restaurantDetails: {}
        };
    }

    /**
     * This will be called before mounting the component, pulls the restaurant details
     * to show on the page along with the categories and items under it
     */
    UNSAFE_componentWillMount() {
        let restaurantID = this.props.match.params.restaurantID;
        let xhr = new XMLHttpRequest();
        let thisComponent = this;
        xhr.addEventListener('readystatechange', function () {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.response);
                let categories = response.categories;
                let categoriesText = '';
                // parse the categories separated by ',' to show as single text
                for (let index = 0; index < categories.length; index++) {
                    categoriesText = categoriesText.concat(categories[index].category_name);
                    if (index < categories.length - 1) {
                        categoriesText = categoriesText.concat(',').concat(' ');
                    }
                }
                // set the restaurant details from the api response
                let restaurantDetails = {
                    uuid: response.id,
                    restaurantName: response.restaurant_name,
                    photoURL: response.photo_URL,
                    customerRating: response.customer_rating,
                    averagePrice: response.average_price,
                    noOfCustomersRated: response.number_customers_rated,
                    locality: response.address.locality,
                    categories: response.categories,
                    categoriesText: categoriesText
                }
                // Set the details to state variable
                thisComponent.setState({
                    restaurantDetails: restaurantDetails
                });
            }
        })
        let data = null;
        // Access the get restaurant api of backend to get the details based on restaurantID
        xhr.open('GET', this.props.baseUrl + '/restaurant/' + restaurantID);
        xhr.send(data);
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <Header pageId='details' baseUrl={this.props.baseUrl} />
                {/**
                 * Show the complete page with details only if server responds with data of restaurant
                 * i.e. if uuid is not valid, then no data received from server and nothing will be displayed
                 */}
                {this.state.restaurantDetails.uuid &&
                    <div>
                        <div className='restaurant-info-container'>
                            <div className='image-section'>
                                {/**
                                 * Show the restaurant image
                                 */}
                                <img className='restaurant-img' src={this.state.restaurantDetails.photoURL} alt={this.state.restaurantDetails.restaurantName} />
                            </div>
                            {/**
                             * Show the details of the restaurant
                             */}
                            <div className='details-section'>
                                <Typography variant='h4' component='h4' className={classes.detail}>
                                    {this.state.restaurantDetails.restaurantName}
                                </Typography>
                                <Typography variant='subtitle2' component='p' className={classes.detail}>
                                    {this.state.restaurantDetails.locality}
                                </Typography>
                                <Typography variant='subtitle2' component='p' className={classes.detail}>
                                    {this.state.restaurantDetails.categoriesText}
                                </Typography>
                                {/**
                                 * Show the ratings, no of customers rated along with the average price for two
                                 */}
                                <div className='rating-price-container'>
                                    <div className='rating-section'>
                                        <Typography variant='subtitle1' component='p' className={classes.bold}>
                                            <FontAwesomeIcon icon={faStar} className='fa-star-icon' /> {this.state.restaurantDetails.customerRating}
                                        </Typography>
                                        <Typography variant='caption' component='p' className='caption-text'>
                                            AVERAGE RATING BY <span className='no-of-customers'>{this.state.restaurantDetails.noOfCustomersRated}</span> CUSTOMERS
                                    </Typography>
                                    </div>
                                    <div className='price-section'>
                                        <Typography variant='subtitle1' component='p' className={classes.bold}>
                                            <FontAwesomeIcon icon={faRupeeSign} /> {this.state.restaurantDetails.averagePrice}
                                        </Typography>
                                        <Typography variant='caption' component='p' className='caption-text'>
                                            AVERAGE COST FOR TWO PEOPLE
                                    </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id='items-checkout-container'>
                            {/**
                             * The list of menu items available in the restaurant along with their price
                             */}
                            <div className='items-container'>
                                {this.state.restaurantDetails.categories.map(category => (
                                    <div key={category.id}>
                                        {/**
                                         * Show the category name
                                         */}
                                        <Typography className={classes.category}>
                                            <span className='category-name'>{category.category_name}</span>
                                        </Typography>
                                        <Divider />
                                        {category.item_list.map(item => (
                                            <div className='menu-item-section' key={item.id}>
                                                {/**
                                                 * Show the circle based on item time red(non veg)/green(veg)
                                                 */}
                                                {'VEG' === item.item_type && <FontAwesomeIcon icon={faCircle} className='fa-circle-green' />}
                                                {'NON_VEG' === item.item_type && <FontAwesomeIcon icon={faCircle} className='fa-circle-red' />}

                                                <Typography className={classes.menuItem}>
                                                    <span className='menu-item'>{item.item_name}</span>
                                                </Typography>
                                                {/**
                                                 * Show rupee symbol and the price of the item with a plus sign icon to add to cart
                                                 */}
                                                <span className='item-price'>
                                                    <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />{item.price}
                                                </span>
                                                <IconButton className={classes.addIcon}><AddIcon /></IconButton>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className='cart-checkout-container'>

                            </div>
                        </div>
                    </div >
                }
            </div>
        )
    }
}

export default withStyles(styles)(Details);