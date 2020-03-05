import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import SearchIcon from '@material-ui/icons/Search';
import React, { Component } from 'react';
import Modal from 'react-modal';
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
        margin: '15px 20px'
    },
    /* Style the search input text box with color, margin & border*/
    searchRestaurantTextInput: {
        color: 'white',
        margin: '10px',
        /* Set the border to white after selecting the text box */
        '&:after': {
            'border-bottom': '2px solid white',
        },
        'padding-bottom': '2px'
    },
    /* Set the margin, padding for login button */
    loginBtn: {
        margin: '10px 15px 10px 5px',
        'padding-top': '8px',
        'padding-bottom': '8px'
    },
    /* Set the margin, padding for Profile button */
    profileBtn: {
        margin: '10px 15px 10px 5px',
        'padding-top': '8px',
        'padding-bottom': '8px'
    },
    /* Set the width of form input fields */
    formInputControl: {
        width: '80%'
    }

});

/**
 * Style the login/signup modal to position at the center of page
 */
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
}

/**
 * Container to display the contents and align to center
 * @param {*} props 
 */
const TabContainer = function (props) {
    return (
        <Typography component='div' className='tab-container'>
            {props.children}
        </Typography>
    );
}

class Header extends Component {

    constructor() {
        super();
        /**
         * Set the state will all the required fields and values
         */
        this.state = {
            modalIsOpen: false,
            value: 0,
            isUserLoggedIn: false,
            showMenu: false,
            loggedUserFirstName: '',
            contactNo: '',
            contactNoRequired: 'dispNone',
            invalidLoginContactNo: 'dispNone',
            loginPassword: '',
            loginPasswordRequired: 'dispNone',
            loginFailureMsg: '',
            firstName: '',
            firstNameRequired: 'dispNone'
        }
    }

    /**
     * Click handler for login button on header
     * Opens the login/Signup modal for the customer to signup or login
     * reset the field values for the modal tabs
     */
    loginClickHandler = () => {
        this.setState({
            modalIsOpen: true,
            contactNo: '',
            contactNoRequired: 'dispNone',
            invalidLoginContactNo: 'dispNone',
            loginPassword: '',
            loginPasswordRequired: 'dispNone',
            loginFailureMsg: '',
            firstName: '',
            firstNameRequired: 'dispNone'
        });
    }

    /**
     * Handler for on close of login/signup modal
     * Hides the Modal and shows the page
     */
    closeModalHandler = () => {
        this.setState({ modalIsOpen: false });
    }

    /**
     * Switching the tabs on the login/signup modal
     */
    tabChangeHandler = (event, value) => {
        this.setState({ value });
    }

    /**
     * Set the value of input field to state for contact no
     */
    inputContactNoChangeHandler = (e) => {
        this.setState({ contactNo: e.target.value })
    }

    /**
     * Set the value of input field to state for password
     */
    inputPasswordChangeHandler = (e) => {
        this.setState({ loginPassword: e.target.value });
    }

    /**
     * Validate input values for Login tab
     * checks if the contactNo and password are keyed in and if contactNo is in expected mobile number format
     * Error messages will be shown if inputs are not provided and if any failure from the server
     */
    tabLoginClickHandler = () => {
        this.setState({ loginFailureMsg: '' });
        // check for empty field validation, show error message if empty
        this.state.contactNo === '' ? this.setState({ contactNoRequired: 'dispBlock', invalidLoginContactNo: 'dispNone' }) : this.setState({ contactNoRequired: 'dispNone', invalidLoginContactNo: 'dispNone' });
        this.state.loginPassword === '' ? this.setState({ loginPasswordRequired: 'dispBlock' }) : this.setState({ loginPasswordRequired: 'dispNone' });

        let contactNoPattern = new RegExp('^\\d{10}$');

        // check if the contactNo is 10 digits or not
        if (this.state.contactNo !== '' && !contactNoPattern.test(this.state.contactNo)) {
            this.setState({ contactNoRequired: 'dispNone', invalidLoginContactNo: 'dispBlock' });
        } else if (this.state.contactNo !== '' && this.state.loginPassword !== '') {
            // both the contactNo and password are keyed in, access the login api of backend
            let thisComponent = this;
            let xhr = new XMLHttpRequest();

            xhr.addEventListener('readystatechange', function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        let response = JSON.parse(this.response);
                        // Set the user first name and access token to session storage
                        sessionStorage.setItem('userFirstName', response.first_name);
                        sessionStorage.setItem('access-token', this.getResponseHeader('access-token'));
                        thisComponent.setState({ isUserLoggedIn: true, loggedUserFirstName: response.first_name });
                        // Close the modal after successful login
                        thisComponent.closeModalHandler();
                    } else if (this.status === 401) {
                        // Authentication failure from Server
                        let response = JSON.parse(this.response);
                        if ('ATH-001' === response.code || 'ATH-002' === response.code) {
                            thisComponent.setState({ loginFailureMsg: response.message });
                        }
                    }
                }
            });
            let data = null;
            // convert the credentials to Base64 format for Basic authorization
            let authorization = window.btoa(this.state.contactNo + ':' + this.state.loginPassword);
            xhr.open('POST', this.props.baseUrl + '/api/customer/login');
            xhr.setRequestHeader('Authorization', 'Basic ' + authorization);
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data);
        }
    }

    /**
     * Show the menu options on click of profile in the header
     */
    profileClickHandler = (event) => {
        this.setState({
            showMenu: !this.state.showMenu,
            anchorEl: this.state.anchorEl != null ? null : event.currentTarget
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className='app-header'>
                {/**
                 * Show the Fast food icon
                 */}
                <FastfoodIcon className={classes.logo} />
                <div id='search-box-section'>
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

                {this.state.isUserLoggedIn ?
                    <section>
                        {/**
                         * Button showing the Account icon and logged in user first name 
                         */}
                        <Button variant='text' className={classes.profileBtn} onClick={this.profileClickHandler}><AccountCircleIcon className='user-account-icon' />
                            <span className='user-name'>{this.state.loggedUserFirstName}</span>
                        </Button>
                        {/**
                         * Options menu on click of Profile, to show My Profile and Logout
                        */}
                        <Menu
                            id='profile-menu'
                            anchorEl={this.state.anchorEl}
                            keepMounted
                            open={this.state.showMenu}
                            onClose={this.profileClickHandler}
                            className='profile-options-menu'>
                            <MenuItem>
                                <span className='menu-option'>My Profile</span>
                            </MenuItem>
                            <MenuItem>
                                <span className='menu-option'>Logout</span>
                            </MenuItem>
                        </Menu>
                    </section>
                    :
                    /**
                     * Login button with account circle icon
                     */
                    <Button variant='contained' color='default' className={classes.loginBtn} onClick={this.loginClickHandler}>
                        <AccountCircleIcon className='account-icon' />Login
                    </Button>
                }
                {/**
                 * Login/Signup customer modal with Login and Signup tabs
                 */}
                <Modal ariaHideApp={false} isOpen={this.state.modalIsOpen} contentLabel='Login' onRequestClose={this.closeModalHandler} style={customStyles}>
                    <Tabs className='tabs' value={this.state.value} onChange={this.tabChangeHandler}>
                        <Tab label='LOGIN' />
                        <Tab label='SIGNUP' />
                    </Tabs>
                    {/**
                     * Show the login tab with contact no and password for the customer to login to application
                     */}
                    {this.state.value === 0 &&
                        <TabContainer>
                            <FormControl className={classes.formInputControl} required>
                                <InputLabel htmlFor='contactNo'>Contact No</InputLabel>
                                <Input id='contactNo' type='text' onChange={this.inputContactNoChangeHandler} fullWidth />
                                <FormHelperText className={this.state.contactNoRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                                <FormHelperText className={this.state.invalidLoginContactNo}>
                                    <span className='red'>Invalid Contact</span>
                                </FormHelperText>
                            </FormControl>
                            <br /><br />
                            <FormControl className={classes.formInputControl} required>
                                <InputLabel htmlFor='loginPassword'>Password</InputLabel>
                                <Input id='loginPassword' type='password' onChange={this.inputPasswordChangeHandler} fullWidth />
                                <FormHelperText className={this.state.loginPasswordRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                                {/**
                                 * Error Text message if in case the provided credentials doesn't match with the server database
                                 * records
                                 */}
                                {this.state.loginFailureMsg !== '' &&
                                    <FormHelperText>
                                        <span className='red'>{this.state.loginFailureMsg}</span>
                                    </FormHelperText>
                                }
                            </FormControl>
                            <br /><br />
                            <Button variant='contained' color='primary' onClick={this.tabLoginClickHandler}>Login</Button>
                        </TabContainer>
                    }
                </Modal>
            </div>
        );
    }
}

export default withStyles(styles)(Header);