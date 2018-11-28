/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  reduxPanel: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#444',
    width: '100%',
    overflow: 'auto'
  }
};

class ReduxListenerPanel extends React.PureComponent {
  static propTypes = {
    api: PropTypes.shape({
      onStory: PropTypes.func.isRequired,
    }).isRequired,
    channel: PropTypes.shape({
      on: PropTypes.func.isRequired,
      removeListener: PropTypes.func.isRequired,
    }).isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = { actions: [] };
    this.onActionTriggered = this.onActionTriggered.bind(this);
  }

  componentDidMount() {
    const { api, channel } = this.props;

    // Listen to the Redux action event and render
    channel.on(
      'addon/redux-listener/actionTriggered', this.onActionTriggered
    );

    // Clear the current action on every story change.
    this.stopListeningOnStory = api.onStory(() => {
      this.setState({ actions: [] });
    });
  }

  // This is some cleanup tasks when the actions panel is unmounting.
  componentWillUnmount() {
    if (this.stopListeningOnStory) {
      this.stopListeningOnStory();
    }

    this.unmounted = true;

    const { channel } = this.props;
    channel.removeListener(
      'addon/redux-listener/actionTriggered', this.onActionTriggered
    );
  }

  onActionTriggered(action) {
    this.setState({
      actions: [...this.state.actions, action]
    });
  }

  renderActions() {
    if (!this.state.actions.length) {
      return (
        <tr />
      );
    }

    return this.state.actions.map((action, index) => {
      const {type, ...rest} = action
      return (
        <tr key={index}>
          <td>{type}</td>
          <td><pre>{JSON.stringify(rest, null, 2)}</pre></td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div style={styles.reduxPanel}>
        <table>
          <tbody>
            <tr>
              <th>Type</th>
              <th>Payload</th>
            </tr>
            {this.renderActions()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ReduxListenerPanel;
