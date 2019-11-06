const { React } = require('powercord/webpack');
const Toast = require('./Toast');

class ToastContainer extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = { leaving: null };
    this._addedHandler = () => this.forceUpdate();
    this._leavingHandler = (id) => {
      this.setState({ leaving: id });
      setTimeout(() => this.setState({ leaving: null }), 510);
    };
  }

  componentDidMount () {
    powercord.api.notices.on('toastAdded', this._addedHandler);
    powercord.api.notices.on('toastLeaving', this._leavingHandler);
  }

  componentWillUnmount () {
    powercord.api.notices.off('toastAdded', this._addedHandler);
    powercord.api.notices.off('toastLeaving', this._leavingHandler);
  }

  render () {
    const toast = Object.keys(powercord.api.notices.toasts).pop();
    return <div className='powercord-toast-container'>
      {toast && <Toast
        leaving={this.state.leaving === toast} id={toast}
        {...powercord.api.notices.toasts[toast]}
      />}
    </div>;
  }
}

module.exports = ToastContainer;
