import { faStopCircle } from '@fortawesome/fontawesome-free-regular';
import { faRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardHeader, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';
import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Header from '../../common/Header';
import './Checkout.css';

/**
 * Custom Styles used to customize material ui components
 * @param {*} theme
 */
const styles = theme => ({
    /** Style the back button in the stepper */
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    /** Set the bottom margin for the action container in stepper */
    actionsContainer: {
        marginBottom: theme.spacing(2)
    },
    /** Set padding for the area which resets the stepper */
    resetContainer: {
        padding: theme.spacing(3)
    },
    /**
     * Set the margin and width for the form input controls
     */
    formControl: {
        margin: theme.spacing(1),
        width: 200,
    },
    /** Style the grid list of addresses with nowrap */
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)'
    },
    /** Set the border color for selected address grid */
    coloredBorder: {
        border: '2px solid #e0265f',
        boxShadow: '2px 2px #e0265f',
        borderRadius: '5px',
        margin: '10px'
    },
    /** Set no border when address grid is not selected */
    noBorder: {
        border: 'none',
        margin: '10px'
    },
    /** Align the button icon to the right */
    buttonAlign: {
        float: 'right'
    },
    /** Setting color to green */
    green: {
        color: 'green'
    },
    /** Setting color to grey */
    grey: {
        color: 'grey',
    },
    /** Set the bottom margin for button */
    buttonMargin: {
        marginTop: '20px'
    },
    /* Set the margin for menu item */
    cartMenuItem: {
        marginLeft: '4%',
        width: '40%'
    },
    /** Style the coupon field text box */
    textField: {
        marginBottom: '20px',
        backgroundColor: 'rgb(255, 255, 102) !important'
    },
    /** Set the bottom margin for apply coupon button */
    applyBtn: {
        marginBottom: '20px'
    }
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
        // if state is passed from the previous screen read the cart items
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
            isUserLoggedIn: sessionStorage.getItem('access-token') !== null,
            cols: 3,
            activeStep: 0,
            paymentModes: [],
            selectedPaymentId: '',
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
            selectedAddressId: '',
            cartItems: cartItems,
            cartTotalAmount: 0,
            restaurantID: restaurantID,
            restaurantName: restaurantName,
            couponName: '',
            couponId: '',
            discountPercentage: 0,
            discount: 0,
            subTotal: 0,
            totalAmountWithoutDiscount: 0,
            showSnackbar: false,
            snackBarMsg: '',
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

        // Call the backend to fetch all the addresses of current logged in customer
        this.fetchSavedAddressesOfCustomer();

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

    fetchSavedAddressesOfCustomer = () => {
        /**
         * this will be used to get the saved addresses for a customer
         */
        let xhrDataAddress = new XMLHttpRequest();
        let thisComponent = this;
        xhrDataAddress.addEventListener("readystatechange", function () {
            // If the response from server is success
            if (this.readyState === 4 && this.status === 200) {
                // Set the saved addresses to state
                thisComponent.setState({
                    customerAddresses: JSON.parse(this.response).addresses
                });
                let addressIsSelectedInitial = [];
                for (var i = 0; i < thisComponent.state.customerAddresses.length; i++) {
                    addressIsSelectedInitial[i] = false;
                }
                thisComponent.setState({
                    addressIsSelected: addressIsSelectedInitial
                })
            }
        });
        xhrDataAddress.open("GET", this.props.baseUrl + '/address/customer');
        xhrDataAddress.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('access-token'));
        xhrDataAddress.setRequestHeader("Content-Type", "application/json");
        xhrDataAddress.send();
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
            pincodeRequired = 'dispNone';
            invalidPincode = 'dispBlock';
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
                    thisComponent.fetchSavedAddressesOfCustomer();
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
            selectedPaymentId: event.target.value
        })
    };

    /**
     * Switching the tabs on existing address and adding new address
     */
    tabChangeHandler = (event, value) => {
        this.setState({ value });
        if (value === 1) {
            // If the New Address tab is selected, clear the form errors
            this.setState({
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
            })
        }
    }

    /**
     * prevent default submission of form
     */
    handleSubmit = (event) => {
        event.preventDefault();
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
        this.setState({
            addressIsSelected: addressIsSelectedChange,
            selectedAddress: true,
            selectedAddressId: this.state.customerAddresses[index].id
        })
    }

    /** this method is used to get step content */
    getStepContent(step) {
        const { classes } = this.props;
        switch (step) {
            case 0:
                return <React.Fragment>
                    <Tabs className='address-tabs' value={this.state.value} onChange={this.tabChangeHandler}>
                        <Tab label='EXISTING ADDRESS' />
                        <Tab label='NEW ADDRESS' />
                    </Tabs>
                    {this.state.value === 0 && this.state.customerAddresses.length !== 0 &&
                        <TabContainer>
                            <div>
                                <GridList className={classes.gridList} cols={this.state.cols} spacing={2} cellHeight={"auto"}>
                                    {this.state.customerAddresses.map((address, index) => (
                                        <GridListTile key={address.id} className={(this.state.addressIsSelected[index] === true ? classes.coloredBorder : classes.noBorder)}
                                            onClick={() => this.addressSelectionHandler(index)}>
                                            <div className='grid-address'>
                                                <Typography variant="subtitle1" component="p">{address.flat_building_name}</Typography>
                                                <Typography variant="subtitle1" component="p">{address.locality}</Typography>
                                                <Typography variant="subtitle1" component="p">{address.city}</Typography>
                                                <Typography variant="subtitle1" component="p">{address.state.state_name}</Typography>
                                                <Typography variant="subtitle1" component="p">{address.pincode}</Typography>
                                                <div className={classes.buttonAlign}>
                                                    <IconButton className={this.state.addressIsSelected[index] !== true ? classes.grey : classes.green}
                                                        aria-label="checkCircle" onClick={() => this.addressSelectionHandler(index)}>
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </GridListTile>
                                    ))}
                                </GridList>
                            </div>
                        </TabContainer>
                    }
                    {this.state.value === 0 && this.state.customerAddresses.length === 0 &&
                        <TabContainer>
                            <Typography variant="body1" className={classes.grey}>There are no saved addresses! You can save an address using the &apos;New Address&apos; tab or using your &lsquo;Profile&rsquo; menu option.</Typography>
                        </TabContainer>
                    }
                    {/**
                     * Save Address form for entering the details of the address like bulding no, locality, 
                     * city, state and pincode on selecting the New Address tab along with error field validation
                     * messages as helper texts
                     */}
                    <form onSubmit={this.handleSubmit}>
                        {this.state.value === 1 &&
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
                                        }} fullWidth>
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
                    </form>
                </React.Fragment >;
            case 1:
                return (
                    <FormControl component="fieldset">
                        <FormLabel>Select Mode of Payment</FormLabel>
                        <RadioGroup defaultValue={this.state.paymentModes.payment_name} aria-label="paymentModes" name="paymentModes" id='handleChangePayment' onChange={this.handleChangePayment}>
                            {this.state.paymentModes.map((payment) => (
                                <FormControlLabel key={payment.id} value={payment.id} control={<Radio />} label={payment.payment_name} checked={this.state.selectedPaymentId === payment.id} />))
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
         *  if the index 0 i.e existing address, then it will check if any 
         *  address is selected. only then move to next step i.e payment mode
         */
        if (index === 0) {
            if (this.state.selectedAddress === true) {
                this.setState({ activeStep: prevActiveStep })
            }
        } else if (index === 1) {
            /**
             * if the index 1 i.e payment mode than it will check if any payment 
             * mode is selected, then only it will finish the stepper selection
             */
            if (this.state.selectedPaymentId !== '') {
                this.setState({ activeStep: prevActiveStep })
            }
        }
    };

    /**
     * This method is used to move the stepper to previous step
     */
    handleBack = () => {
        var prevActiveStep = this.state.activeStep - 1;
        this.setState({ activeStep: prevActiveStep })
    };

    /**
     * This method is called on click of 'Change' Button
     * and is used  to change the value selected in stepper
     * to show the Delivery step again for the customer to choose
     */
    handleReset = () => {
        this.setState({ activeStep: 0 });
    };

    /**
     * This method is called once all the elements on the page
     * are rendered, it is used to set state for cartItems
     */
    componentDidMount() {
        // if the cart items are present in state, update the cart total amount
        if (this.state.cartItems) {
            let cartTotalAmount = 0;
            this.state.cartItems.forEach(cartItem => {
                cartTotalAmount += cartItem.totalItemPrice;
            });
            // update total amount without discount for applying any coupon if customer provides
            this.setState({
                cartTotalAmount: cartTotalAmount,
                totalAmountWithoutDiscount: cartTotalAmount
            })
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
        // Add event listener for window resize
        window.addEventListener('resize', this.updateGridViewCols);
    }

    /**
     * Remove the resize event listener when the component is about to unmount
     */
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateGridViewCols);
    }

    /**
     * This method updates the number of columnns to be displayed in Grid List based
     * on the window inner width, show three addresses in large view and two in small view
     * screens
     */
    updateGridViewCols = () => {
        if (window.innerWidth <= 650) {
            this.setState({ cols: 2 });
        } else {
            this.setState({ cols: 3 });
        }
    }

    /** this method will called when coupon code is changed  */
    couponChangeHandler = (event) => {
        this.setState({ couponName: event.target.value });
    }

    /** this method will be called when apply button is clicked */
    applyButtonHandler = () => {
        /**
         * this will be used to get the different payment methods
         */
        let that = this;
        let xhrCoupon = new XMLHttpRequest();
        let data = null;
        xhrCoupon.addEventListener("readystatechange", function () {
            // If the response from server is success
            if (this.readyState === 4 && this.status === 200) {
                // Set the percentage Discount to state
                that.setState({
                    discountPercentage: JSON.parse(this.response).percent
                });
                // calculate the discount amount and update the final amount
                let discountCal = (that.state.totalAmountWithoutDiscount * that.state.discountPercentage) / 100;
                let priceAfterDiscount = that.state.totalAmountWithoutDiscount - discountCal;
                that.setState({
                    subTotal: that.state.totalAmountWithoutDiscount,
                    discount: discountCal,
                    cartTotalAmount: priceAfterDiscount,
                    couponId: JSON.parse(this.response).id,
                    showSnackbar: true,
                    snackBarMsg: 'Coupon applied Successfully!',
                });
            }/** if invalid coupon is searched */
            else if (this.readyState === 4 && this.status !== 200) {
                // show the snack bar with the error message received from server
                that.setState({
                    showSnackbar: true,
                    snackBarMsg: JSON.parse(this.response).message,
                    netAmount: that.state.totalAmountWithoutDiscount,
                    discountPercentage: 0,
                    discount: 0,
                    couponId: '',
                    cartTotalAmount: that.state.totalAmountWithoutDiscount
                });

            }
        });
        xhrCoupon.open("GET", this.props.baseUrl + '/order/coupon/' + this.state.couponName);
        xhrCoupon.setRequestHeader('authorization', 'Bearer ' + sessionStorage.getItem('access-token'));
        xhrCoupon.setRequestHeader("Content-Type", "application/json");
        xhrCoupon.send(data);

    }

    /** this method will called when 'place order' button is clicked */
    checkoutClickHandler = (event) => {
        /** Call to backend API to place an order will be made only
         if Delivery Address and Payment Option is selected */
        if (this.state.selectedAddressId !== '' && this.state.selectedPaymentId !== '') {
            let that = this;
            let xhrCheckOut = new XMLHttpRequest();
            var itemsInCart = [];
            var saveOrderRequest = null;
            for (var k = 0; k < this.state.cartItems.length; k++) {
                var Item = {
                    "item_id": this.state.cartItems[k].id,
                    "price": this.state.cartItems[k].price,
                    "quantity": this.state.cartItems[k].quantity
                }
                itemsInCart[k] = Item;
            }
            /**
             * Create the json request for order Request
             * Will add coupon_id and discount to request
             * only if coupon is applied
            */
            if (this.state.couponName && this.state.discount !== 0) {
                saveOrderRequest = JSON.stringify({
                    "address_id": this.state.selectedAddressId,
                    "bill": this.state.cartTotalAmount,
                    "coupon_id": this.state.couponId,
                    "discount": this.state.discount,
                    "item_quantities": itemsInCart,
                    "payment_id": this.state.selectedPaymentId,
                    "restaurant_id": this.state.restaurantID

                });
            } else {
                saveOrderRequest = JSON.stringify({
                    "address_id": this.state.selectedAddressId,
                    "bill": this.state.cartTotalAmount,
                    "item_quantities": itemsInCart,
                    "payment_id": this.state.selectedPaymentId,
                    "restaurant_id": this.state.restaurantID,
                });
            }
            xhrCheckOut.addEventListener("readystatechange", function () {
                // If the response from server is success
                if (this.readyState === 4 && this.status === 201) {
                    // Set the percentage Discount to state
                    that.setState({
                        showSnackbar: true,
                        snackBarMsg: 'Order placed successfully! Your order ID is ' + JSON.parse(this.response).id + '.'
                    });
                    // Delay the redirect to home after successful order
                    that.delayRedirect(event);

                }/** if the response from server is not successs */
                else if (this.readyState === 4 && this.status !== 201) {
                    that.setState({
                        showSnackbar: true,
                        snackBarMsg: 'Unable to place your order! Please try again!'
                    });
                }
            });
            xhrCheckOut.open("POST", this.props.baseUrl + '/order');
            xhrCheckOut.setRequestHeader('authorization', 'Bearer ' + sessionStorage.getItem('access-token'));
            xhrCheckOut.setRequestHeader("Content-Type", "application/json");
            xhrCheckOut.send(saveOrderRequest);
        }   /** If Delivery and Payment is not selected than just a message will be shown to select both options first */
        else {
            this.setState({
                showSnackbar: true,
                snackBarMsg: 'Please select Delivery and Payment Option before Placing an Order !'
            });
        }
    }

    /**
     * Redirect to home after few seconds of placing the order successfully
     */
    delayRedirect = (event) => {
        const { history: { push } } = this.props;
        setTimeout(() => push('/'), 10000);
    }

    /**
     * Handle Close event on Snackbar, if close event is triggered, hide it
     */
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        // Setting the state variable to hide the Snackbar
        this.setState({ showSnackbar: false, snackBarMsg: '' });
    }

    /**
     * Update the user logged in status when logout is clicked in header and successful logout
     */
    updateLoginStatus = () => {
        this.setState({ isUserLoggedIn: false });
    }

    render() {

        const { classes } = this.props;

        return (
            <div>
                {/**
                 * Redirect to home page on logout
                 */}
                {!this.state.isUserLoggedIn && <Redirect to='/' />}
                {/**
                 * the data passed in to this component can be used using
                 * this.props.location.state.cartItems
                 * this.props.location.state.restaurantID
                 */}
                <Header pageId='checkout' baseUrl={this.props.baseUrl} updateLoginStatus={this.updateLoginStatus} />
                <div className='checkout-container'>
                    <div className="stepper-section">
                        <Stepper activeStep={this.state.activeStep} orientation="vertical">
                            {this.state.steps.map((label, index) => (
                                <Step key={label}>
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
                        {this.state.activeStep === this.state.steps.length && this.state.selectedPaymentId !== '' && (
                            <Paper square elevation={0} className={classes.resetContainer}>
                                <Typography variant="subtitle1" component="p">View the summary and place your order now!</Typography>
                                <Button onClick={this.handleReset} className={classes.button}>
                                    Change
                        </Button>
                            </Paper>
                        )}
                    </div>
                    <div className='checkout-cart-container'>
                        <Card variant='outlined' className='checkout-cart-card'>
                            {/**
                             * Show the Card header with Summary text
                             */}
                            <CardHeader
                                title='Summary'
                                titleTypographyProps={{
                                    variant: 'h5'
                                }}>
                            </CardHeader>
                            <CardContent>
                                <Typography variant='h6' component='h6' gutterBottom className='checkout-restaurant-name'>
                                    {this.state.restaurantName}
                                </Typography>
                                {this.state.cartItems.map(cartItem =>
                                    <div className='checkout-menu-item-section' key={'checkout' + cartItem.id}>
                                        {/**
                                         * Show the stop circle O based on item type red(non veg)/green(veg)
                                         */}
                                        {'VEG' === cartItem.item_type && <FontAwesomeIcon icon={faStopCircle} className='fa-circle-green' />}
                                        {'NON_VEG' === cartItem.item_type && <FontAwesomeIcon icon={faStopCircle} className='fa-circle-red' />}

                                        <Typography className={classes.cartMenuItem}>
                                            <span className='checkout-menu-item color-gray'>{cartItem.item_name}</span>
                                        </Typography>
                                        {/**
                                         * Show the quantity of the item
                                         */}
                                        <section className='checkout-item-quantity-section color-gray'>
                                            <span>{cartItem.quantity}</span>
                                        </section>
                                        {/**
                                         * Show rupee symbol and the price of the item
                                         */}
                                        <span className='checkout-item-price wrap-white-space color-gray'>
                                            <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />
                                            {cartItem.totalItemPrice.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {/**
                                 * Show the discount Coupon section for the user to apply any valid coupons
                                 */}
                                <div className='coupon-area'>
                                    <div className='coupon-content'>
                                        <TextField id="coupon-code" label="Coupon Code" variant="filled" onChange={this.couponChangeHandler} className={classes.textField} placeholder='Ex: FLAT30' />
                                        <Button variant="contained" onClick={this.applyButtonHandler} className={classes.applyBtn}>
                                            APPLY
                                        </Button>
                                    </div>
                                    {/**
                                     * Show the after discount applied details only when the coupon is valid and applied successfully
                                     */}
                                    {this.state.discountPercentage !== 0 &&
                                        <div className="discount-text-container">
                                            <div className="discount-text wrap-white-space">
                                                <Typography className='discount-item-text-checkout'>Sub Total</Typography>
                                                <span className='cart-item-price-checkout wrap-white-space'>
                                                    <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />
                                                    {this.state.subTotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="discount-text">
                                                <Typography className='discount-item-text-checkout wrap-white-space'>Discount</Typography>
                                                <span className='cart-item-price-checkout wrap-white-space'>
                                                    <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />
                                                    {this.state.discount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <Divider />
                                {/**
                                 * Show the Total amount of the cart, price of all items together
                                 */}
                                <div className='checkout-total-amount'>
                                    <Typography>
                                        <span className='bold'>Net Amount</span>
                                    </Typography>
                                    <span className='bold wrap-white-space'>
                                        <FontAwesomeIcon icon={faRupeeSign} className='fa-rupee' />
                                        {this.state.cartTotalAmount.toFixed(2)}
                                    </span>
                                </div>
                                <Button variant='contained' color='primary' onClick={this.checkoutClickHandler} fullWidth>Place Order</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {/**
                 * Show the snack bar at the bottom left of the page
                 * auto hides after 20 seconds, close icon is added to close if needed before the auto hide timesout
                 */}
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.showSnackbar}
                    autoHideDuration={20000}
                    onClose={this.handleClose}
                    TransitionComponent={this.state.transition}
                    message={this.state.snackBarMsg}
                    action={
                        /**
                         * Show close button to close the snackbar if the user wishes to
                         */
                        <React.Fragment>
                            <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleClose}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </React.Fragment>
                    } />
            </div>
        );
    }
}

export default withStyles(styles)(Checkout);