import React, { Component } from 'react';
import Header from '../../common/Header';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

/**
 * Custom Styles used to customize material ui components
 * @param {*} theme
 */
const styles = theme => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
});


class Checkout extends Component {

    constructor() {
        super();
        /**
         * Set the state with all the required fields and values
         */
        this.state = {
            activeStep: 0,
            paymentMode: [],
            selectedPaymentMode: ''
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
        let paymentMethod = null;
        xhrData.addEventListener("readystatechange", function () {
            // If the response from server is success
            if (this.readyState === 4 && this.status === 200) {
                // Set the payment methods data to state
                that.setState({
                    paymentMode: JSON.parse(this.response).paymentMethods
                });
                //console.log("payment method:" + JSON.stringify(that.state.paymentMode));
            }
        });
        xhrData.open("GET", this.props.baseUrl + '/payment');
        xhrData.send(paymentMethod);

    }

    getSteps() {
        return ['Delivery', 'Payment'];
    }

    /** this is used handle change when the checkbox for payment is selected */
    handleChange = event => {
        //setValue(event.target.value);
        //console.log("selected value" + event.target.value)
        this.setState({
            selectedPaymentMode: event.target.value
        })
    };

    /** this method is used to get step content */
    getStepContent(step) {
        switch (step + 1) {
            case 1:
                return 'An ad group contains one or more ads which target a shared set of keywords.';
            case 2:
                return (
                    <FormControl component="fieldset">
                        <FormLabel>Select Mode of Payment</FormLabel>
                        <RadioGroup defaultValue={this.state.paymentMode.payment_name} aria-label="paymentMode" name="paymentMode" onChange={this.handleChange}>
                            {this.state.paymentMode.map((payment) => (
                                <FormControlLabel key={payment.id} value={payment.payment_name} control={<Radio />} label={payment.payment_name} checked={this.state.selectedPaymentMode === payment.payment_name} />))
                            }
                        </RadioGroup>
                    </FormControl>)
            default:
                return 'Unknown step';
        }
    }

    handleNext = () => {
        //setActiveStep(prevActiveStep => prevActiveStep + 1);
        var prevActiveStep = this.state.activeStep + 1;
        this.setState({ activeStep: prevActiveStep })

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
            return false;
        }

    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                {/**
                 * the data passed in to this component can be used using
                 * this.props.location.state.cartItems
                 * this.props.location.state.restaurantID
                 */}
                <Header pageId='checkout' baseUrl={this.props.baseUrl} />
                <div className={classes.root}>
                    <Stepper activeStep={this.state.activeStep} orientation="vertical">
                        {this.getSteps().map((label, index) => (
                            <Step key={label} >
                                <StepLabel>{label}</StepLabel>
                                <StepContent>
                                    {this.getStepContent(index)}
                                    <div className={classes.actionsContainer}>
                                        <div>
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
                                                onClick={this.handleNext}
                                                className={classes.button}
                                            >
                                                {this.state.activeStep === this.getSteps().length - 1 ? 'Finish' : 'Next'}
                                            </Button>
                                        </div>
                                    </div>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                    {this.state.activeStep === this.getSteps().length && this.state.selectedPaymentMode !== '' && (
                        <Paper square elevation={0} className={classes.resetContainer}>
                            <Typography>View the summary & place your order now!</Typography>
                            <Button onClick={this.handleReset} className={classes.button}>
                                Change
          </Button>
                        </Paper>
                    )}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Checkout);