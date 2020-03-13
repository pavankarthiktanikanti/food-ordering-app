import React, { Component } from 'react';
import Header from '../../common/Header';

class Checkout extends Component {

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
    }

    render() {
        return (
            <div>
                {/**
                 * the data passed in to this component can be used using
                 * this.props.location.state.cartItems
                 * this.props.location.state.restaurantID
                 */}
                <Header pageId='checkout' baseUrl={this.props.baseUrl} />
            </div>
        );
    }
}

export default Checkout;