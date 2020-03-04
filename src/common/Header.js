import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import SearchIcon from '@material-ui/icons/Search';
import React, { Component } from 'react';
import './Header.css';

/**
 * Custom Styles used to customize material ui components
 * @param {*} theme
 */
const styles = theme => ({
    /* Style the fast food logo */
    logo: {
        color: 'white',
        'font-size': 'xx-large',
        margin: '5px'
    },
    /* Style the search input text box with color, width, margin & border*/
    searchRestaurantTextInput: {
        color: 'white',
        margin: '5px',
        /* Set the border to white after selecting the text box */
        '&:after': {
            'border-bottom': '2px solid white',
        }
    },
    /* Set the margin for login button */
    loginBtn: {
        margin: '5px'
    }

});

class Header extends Component {
    render() {
        const { classes } = this.props;
        return (
            <div className='app-header'>
                {/**
                 * Show the Fast food icon
                 */}
                <FastfoodIcon className={classes.logo} />
                <div id="search-box-section">
                    <Input
                        startAdornment={
                            /**
                             * Show the magnifier Search icon inside the text box at the start
                             */
                            <InputAdornment>
                                <SearchIcon className='search-icon' />
                            </InputAdornment>
                        }
                        placeholder='Search by Restaurant Name' className={classes.searchRestaurantTextInput} fullWidth />
                </div>

                {/**
                 * Login button with account circle icon
                 */}
                <Button variant='contained' color='default' className={classes.loginBtn}>
                    <AccountCircleIcon className='account-icon' />Login
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(Header);