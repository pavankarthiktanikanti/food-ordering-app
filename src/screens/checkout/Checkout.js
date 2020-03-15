import React, { Component } from 'react';
import Header from '../../common/Header';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import GridList from '@material-ui/core/GridList';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { faStopCircle } from '@fortawesome/fontawesome-free-regular';
import { faRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardHeader, withStyles } from '@material-ui/core';
import './Checkout.css';

/**
 * Custom Styles used to customize material ui components
 * @param {*} theme
 */
const styles = theme => ({
    root: {
        width: '65%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2)
    },
    resetContainer: {
        padding: theme.spacing(3)
    },
    stateSelect: {
        width: '170px'
    },
    rootGrid: {
        display: 'flex',
        flexWrap: 'no-wrap',
        overflowX: 'scroll',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
        height: '70%'
    },
    addressTabs: {
        backgroundColor: '#3f51b5',
        color: 'white',
        marginBottom: '1%'
    },
    redBorder: {
        border: '2px solid red',
        boxShadow: '2px 2px red',
        borderRadius: '5px',
        padding: '10px',
        margin: '10px'
    },
    noBorder: {
        boder: 'none',
        padding: '10px',
        margin: '10px'
    },
    buttonAlign: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    green: {
        color: 'green'
    },
    grey: {
        color: 'grey',
    },
    padding: {
        padding: '10px'
    },
    buttonMargin: {
        marginTop: '20px'
    },
});

/**
 * Container to display the contents and align to center
 * @param {*} props 
 */
const TabContainer = function (props) {
    return (
        <Typography component='div' className="address-tab-container">
            {props.children}
        </Typography>
    );
}


class Checkout extends Component {

    constructor(props) {
        super(props);
        let cartItems = null;
        let restaurantID = null;
        let restaurantName = null;
        if (props.location.state) {
            cartItems = props.location.state.cartItems;
            restaurantID = props.location.state.restaurantID;
            restaurantName = props.location.state.restaurantName;
        } else {
            cartItems = [];
            restaurantID = '';
            restaurantName = '';
        }
        /**
         * Set the state with all the required fields and values
         */
        this.state = {
            activeStep: 0,
            paymentModes: [],
            selectedPaymentMode: '',
            customerAddresses: [],
            value: 0,
            steps: ['Delivery', 'Payment'],
            states: [],
            buildingNo: '',
            buildingNoRequired: 'dispNone',
            locality: '',
            localityRequired: 'dispNone',
            city: '',
            cityRequired: 'dispNone',
            addressState: '',
            stateRequired: 'dispNone',
            pincode: '',
            pincodeRequired: 'dispNone',
            invalidPincode: 'dispNone',
            addressIsSelected: [],
            selectedAddress: false,
            cartItems: cartItems,
            cartTotalAmount: 0,
            restaurantID: restaurantID,
            restaurantName: restaurantName,
        }
    }

    /** this method will be called before the components get mount */
    UNSAFE_componentWillMount() {
        /** 
         *  If the logged in person go's to URL of the checkout page in the 
         *  browser’s address bar without going through the details page than
         *  customer will be redirected to home page
         */
        if (this.props.location.state === undefined) {
            this.props.history.push({
                pathname: '/'
            })
        }
        /**
         * this will be used to get the different payment methods
         */
        let that = this;
        let xhrData = new XMLHttpRequest();
        let data = null;
        xhrData.addEventListener("readystatechange", function () {
            // If the response from server is success
            if (this.readyState === 4 && this.status === 200) {
                // Set the payment methods data to state
                that.setState({
                    paymentModes: JSON.parse(this.response).paymentMethods
                });
            }
        });
        xhrData.open("GET", this.props.baseUrl + '/payment');
        xhrData.send(data);

        /**
         * this will be used to get the saved addresses for a customer
         */
        let xhrDataAddress = new XMLHttpRequest();
        xhrDataAddress.addEventListener("readystatechange", function () {
            // If the response from server is success
            if (this.readyState === 4 && this.status === 200) {
                // Set the saved addresses to state
                that.setState({
                    customerAddresses: JSON.parse(this.response).addresses
                });
                let addressIsSelectedInitial = [];
                for (var i = 0; i < that.state.customerAddresses.length; i++) {
                    addressIsSelectedInitial[i] = false;
                }
                that.setState({ addressIsSelected: addressIsSelectedInitial })
            }
        });
        xhrDataAddress.open("GET", this.props.baseUrl + '/address/customer');
        xhrDataAddress.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('access-token'));
        xhrDataAddress.setRequestHeader("Content-Type", "application/json");
        xhrDataAddress.send(data);

        // this will be used to get states details 

        let xhrDataStates = new XMLHttpRequest();
        xhrDataStates.addEventListener("readystatechange", function () {
            // If the response from server is success
            if (this.readyState === 4 && this.status === 200) {
                //set the list of states to state 
                that.setState({
                    states: JSON.parse(this.response).states
                })
            }
        });
        xhrDataStates.open("GET", this.props.baseUrl + '/states');
        xhrDataStates.send(data);
    }

    /**
     * Click handler used to save a new address after validating all mandatory field checks
     * Saves the address in the backend for the current logged in user
     */
    saveAddressClickHandler = () => {
        let proceedToSaveAddress = true;
        let buildingNoRequired = 'dispNone';
        let localityRequired = 'dispNone';
        let cityRequired = 'dispNone';
        let stateRequired = 'dispNone';
        let pincodeRequired = 'dispNone';
        let invalidPincode = 'dispNone';

        // check for empty field validation, show error message if empty
        // if any of the validation fails for any field, update proceedToSaveAddress
        // to false to halt the save address trigger to backend
        if (this.state.buildingNo === '') {
            buildingNoRequired = 'dispBlock';
            proceedToSaveAddress = false;
        }
        if (this.state.locality === '') {
            localityRequired = 'dispBlock';
            proceedToSaveAddress = false;
        }
        if (this.state.city === '') {
            cityRequired = 'dispBlock';
            proceedToSaveAddress = false;
        }
        if (this.state.pincode === '') {
            pincodeRequired = 'dispBlock';
            proceedToSaveAddress = false;
        }
        if (this.state.addressState === '') {
            stateRequired = 'dispBlock';
            proceedToSaveAddress = false;
        }

        let pincodePattern = new RegExp('^\\d{6}$');

        // check if the pincode is 6 digits or not
        if (this.state.pincode !== '' && !pincodePattern.test(this.state.pincode)) {
            // show invalid pincode error message
            this.setState({ pincodeRequired: 'dispNone', invalidPincode: 'dispBlock' });
            proceedToSaveAddress = false;
        }

        // Set the field validation messages based on the required fields whether populated or not
        this.setState({
            buildingNoRequired: buildingNoRequired,
            localityRequired: localityRequired,
            cityRequired: cityRequired,
            stateRequired: stateRequired,
            pincodeRequired: pincodeRequired,
            invalidPincode: invalidPincode
        });

        // If no field validation error, proceed to submit the address to save in backend
        if (proceedToSaveAddress) {
            let xhr = new XMLHttpRequest();
            let thisComponent = this;
            xhr.addEventListener('readystatechange', function () {
                if (this.readyState === 4 && this.status === 201) {
                    thisComponent.setState({ value: 0 });
                    // TODO call get all addresses

                }
            });
            // Create the json request for address
            let addressData = JSON.stringify({
                "city": this.state.city,
                "flat_building_name": this.state.buildingNo,
                "locality": this.state.locality,
                "pincode": this.state.pincode,
                "state_uuid": this.state.addressState
            });
            // Trigger the save address endpoint
            xhr.open('POST', this.props.baseUrl + '/address');
            xhr.setRequestHeader('authorization', 'Bearer ' + sessionStorage.getItem('access-token'));
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(addressData);
        }
    }

    /** this is used handle change when the checkbox for payment is selected */
    handleChangePayment = event => {
        this.setState({
            selectedPaymentMode: event.target.value
        })
    };

    /**
     * Switching the tabs on existing address and adding new address
     */
    tabChangeHandler = (event, value) => {
        this.setState({ value });
    }

    /**
     * Set the corresponding state variable to the selected/entered input value
     */
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    }

    /** this method is called when a address is selected */
    addressSelectionHandler = (index) => {
        var addressIsSelectedChange = this.state.addressIsSelected;
        for (var j = 0; j < this.state.addressIsSelected.length; j++) {
            if (j === index) {
                addressIsSelectedChange[j] = true;
            } else {
                addressIsSelectedChange[j] = false;
            }
        }
        this.setState({ addressIsSelected: addressIsSelectedChange })
        this.setState({ selectedAddress: true })
    }

    /** this method is used to get step content */
    getStepContent(step) {
        const { classes } = this.props;
        switch (step) {
            case 0:
                return <React.Fragment>
                    <Tabs className={classes.addressTabs} value={this.state.value} onChange={this.tabChangeHandler}>
                        <Tab label='EXISTING ADDRESS' />
                        <Tab label='NEW ADDRESS' />
                    </Tabs>
                    {/**
                     * Save Address form for entering the details of the address like bulding no, locality, 
                     * city, state and pincode on selecting the New Address tab along with error field validation
                     * messages as helper texts
                     */}
                    {this.state.value === 0 && this.state.customerAddresses.length !== 0 &&
                        <TabContainer>
                            <div className={classes.rootGrid}>
                                <GridList className={classes.gridList} cols={3}>
                                    {this.state.customerAddresses.map((address, index) => (
                                        <Grid key={address.id} className={(this.state.addressIsSelected[index] === true ? classes.redBorder : classes.noBorder)}>
                                            <div className={classes.padding}>
                                                <Typography > {address.flat_building_name}</Typography>
                                                <Typography > {address.locality}</Typography >
                                                <Typography > {address.city}</Typography >
                                                <Typography > {address.state_name}</Typography >
                                                <Typography > {address.pincode}</Typography >
                                            </div>
                                            <div className={classes.buttonAlign}>
                                                <IconButton className={this.state.addressIsSelected[index] !== true ? classes.grey : classes.green} aria-label="checkCircle" onClick={() => this.addressSelectionHandler(index)} >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </div>
                                        </Grid>
                                    ))}
                                </GridList>
                            </div>
                        </TabContainer>
                    }
                    {this.state.value === 0 && this.state.customerAddresses.length === 0 &&
                        <TabContainer>
                            <Typography variant="body1" className={classes.grey}>There are no saved addresses! You can save an address using the 'New Address' tab or using your ‘Profile’ menu option.</Typography>
                        </TabContainer>
                    }
                    {
                        this.state.value === 1 &&
                        <TabContainer>
                            <FormControl className={classes.formControl} required>
                                <InputLabel htmlFor='buildingNo'>Flat / Building No.</InputLabel>
                                <Input id='buildingNo' type='text' onChange={this.handleChange('buildingNo')} value={this.state.buildingNo} fullWidth />
                                <FormHelperText className={this.state.buildingNoRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                            </FormControl>
                            <br />
                            <FormControl className={classes.formControl} required>
                                <InputLabel htmlFor='locality'>Locality</InputLabel>
                                <Input id='locality' type='text' onChange={this.handleChange('locality')} value={this.state.locality} fullWidth />
                                <FormHelperText className={this.state.localityRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                            </FormControl>
                            <br />
                            <FormControl className={classes.formControl} required>
                                <InputLabel htmlFor='city'>City</InputLabel>
                                <Input id='city' type='text' onChange={this.handleChange('city')} value={this.state.city} fullWidth />
                                <FormHelperText className={this.state.cityRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                            </FormControl>
                            <br />
                            {/**
                             * The Select input control which shows the list of all states
                             */}
                            <FormControl className={classes.formControl} required>
                                <InputLabel htmlFor='addressState'>State</InputLabel>
                                <Select
                                    value={this.state.addressState}
                                    onChange={this.handleChange('addressState')}
                                    inputProps={{
                                        name: 'addressState',
                                        id: 'addressState',
                                    }} fullWidth className={classes.stateSelect}>
                                    {this.state.states.map(locState =>
                                        <MenuItem key={locState.id} value={locState.id}>{locState.state_name}</MenuItem>
                                    )}
                                </Select>
                                <FormHelperText className={this.state.stateRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                            </FormControl>
                            <br />
                            {/**
                             * Form input for pincode field, if the pincode is empty/not 6 digits, shows error message
                             */}
                            <FormControl className={classes.formControl} required>
                                <InputLabel htmlFor='pincode'>Pincode</InputLabel>
                                <Input id='pincode' type='text' onChange={this.handleChange('pincode')} value={this.state.pincode} fullWidth />
                                <FormHelperText className={this.state.pincodeRequired}>
                                    <span className='red'>required</span>
                                </FormHelperText>
                                <FormHelperText className={this.state.invalidPincode}>
                                    <span className='red'>Pincode must contain only numbers and must be 6 digits long</span>
                                </FormHelperText>
                            </FormControl>
                            <br />
                            <br />
                            <Button variant="contained" color="secondary" onClick={this.saveAddressClickHandler}>
                                Save Address
                            </Button>
                        </TabContainer>
                    }

                </React.Fragment >;
            case 1:
                return (
                    <FormControl component="fieldset">
                        <FormLabel>Select Mode of Payment</FormLabel>
                        <RadioGroup defaultValue={this.state.paymentModes.payment_name} aria-label="paymentModes" name="paymentModes" id='handleChangePayment' onChange={this.handleChangePayment}>
                            {this.state.paymentModes.map((payment) => (
                                <FormControlLabel key={payment.id} value={payment.payment_name} control={<Radio />} label={payment.payment_name} checked={this.state.selectedPaymentMode === payment.payment_name} />))
                            }
                        </RadioGroup>
                    </FormControl>)
            default:
                return 'Unknown step';
        }
    }

    /**
     * this method is used to set the stepper next tab
     */
    handleNext = (index) => {
        var prevActiveStep = this.state.activeStep + 1;
        /**
         *  if the index 0 i.e existing address than it will check if any 
         *  address is selected than only move to next step i.e payment mode
         */
        if (index === 0) {
            if (this.state.selectedAddress === true) {
                this.setState({ activeStep: prevActiveStep })
            }
        } else if (index === 1) {
            /**
             *  if the index 1 i.e payment mode than it will check if any payment *  mode  is selected than only it will finish the stepper selection
           */
            if (this.state.selectedPaymentMode !== '') {
                this.setState({ activeStep: prevActiveStep })
            }
        }
    };

    handleBack = () => {
        var prevActiveStep = this.state.activeStep - 1;
        this.setState({ activeStep: prevActiveStep })
    };

    handleReset = () => {
        this.setState({ activeStep: 0 });
    };

    isStepCompleted = (index) => {
        if (index === 1) {
            if (this.state.selectedPaymentMode !== '') {
                return true;
            } else {
                return false;
            }

        } else {
            if (this.state.selectedAddress === true) {
                return true;
            } else {
                return false;
            }
        }
    }

    componentDidMount() {
        if (this.state.cartItems) {
            let cartTotalAmount = 0;
            this.state.cartItems.forEach(cartItem => {
                cartTotalAmount += cartItem.totalItemPrice;
            });
            this.setState({
                cartTotalAmount: cartTotalAmount
            });
        }
        let xhr = new XMLHttpRequest();
        let thisComponent = this;
        xhr.addEventListener('readystatechange', function () {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                thisComponent.setState({ states: response.states });
            }
        });
        xhr.open('GET', this.props.baseUrl + '/states');
        xhr.send();
    }


    render() {

        const { classes } = this.props;

        return (
            <div >
                {/**
                 * the data passed in to this component can be used using
                 * this.props.location.state.cartItems
                 * this.props.location.state.restaurantID
                 */}
                <Header pageId='checkout' baseUrl={this.props.baseUrl} />
                <div className='checkout-conatiner'>
                    <div className={classes.root}>
                        <Stepper activeStep={this.state.activeStep} orientation="vertical">
                            {this.state.steps.map((label, index) => (
                                <Step key={label} completed={index === 1 ? (this.state.selectedPaymentMode !== '' ? true : false) : (this.state.selectedAddress === true) ? true : false} >
                                    <StepLabel>{label}</StepLabel>
                                    <StepContent>
                                        {this.getStepContent(index)}
                                        <div className={classes.actionsContainer}>
                                            <div className={classes.buttonMargin}>
                                                <Button
                                                    disabled={this.state.activeStep === 0}
                                                    onClick={this.handleBack}
                                                    className={classes.button}
                                                >
                                                    Back
                  </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => this.handleNext(index)}
                                                    className={classes.button}
                                                >
                                                    {this.state.activeStep === this.state.steps.length - 1 ? 'Finish' : 'Next'}
                                                </Button>
                                            </div>
                                        </div>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                        {this.state.activeStep === this.state.steps.length && this.state.selectedPaymentMode !== '' && (
                            <Paper square elevation={0} className={classes.resetContainer}>
                                <Typography>View the summary & place your order now!</Typography>
                                <Button onClick={this.handleReset} className={classes.button}>
                                    Change
                        </Button>
                            </Paper>
                        )}
                    </div>
                    <div className='cart-checkout-container'>
                        <Card variant='outlined' className='cart-checkout-card'>
                            {/**
                                     * Show the Cart icon with badge message and My Cart Card header
                                     */}
                            <CardHeader
                                title='Summary'
                                titleTypographyProps={{
                                    variant: 'h5'
                                }}>
                            </CardHeader>

                            <CardContent>
                                <Typography variant='body1' component='p' gutterBottom style={{ fontSize: 'large', color: 'grey', fontWeight: 500 }}>
                                    {this.state.restaurantName}
                                </Typography>
                                {this.state.cartItems.map(cartItem =>
                                    <div className='cart-menu-item-section' key={'cart' + cartItem.id}>
                                        {/**
                                                 * Show the stop circle O based on item type red(non veg)/green(veg)
                                                 */}
                                        {'VEG' === cartItem.item_type && <FontAwesomeIcon icon={faStopCircle} className='fa-circle-green' />}
                                        {'NON_VEG' === cartItem.item_type && <FontAwesomeIcon icon={faStopCircle} className='fa-circle-red' />}

                                        <Typography className={classes.cartMenuItem}>
                                            <span className='cart-menu-item'>{cartItem.item_name}</span>
                                        </Typography>
                                        {/**
                                                 * Show the quantity with plus and minus icons to increase or decrease quantity
                                                 */}
                                        <section className='item-quantity-section'>
                                            <span style={{ textAlign: 'center' }}>{cartItem.quantity}</span>
                                        </section>
                                        {/**
                                                 * Show rupee symbol and the price of the item with a plus sign icon to add to cart
                                                 */}
                                        <span className='cart-item-price wrap-white-space'>
                                            <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />
                                            {cartItem.totalItemPrice.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {/**
                                         * Show the Total amount of the cart, price of all items together
                                         */}
                                <div className='total-amount'>
                                    <Typography>
                                        <span className='bold'>Net Amount</span>
                                    </Typography>
                                    <span className='bold wrap-white-space'>
                                        <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />
                                        {this.state.cartTotalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                            <Button variant='contained' color='primary' onClick={this.checkoutClickHandler} fullWidth>Place Order</Button>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Checkout);