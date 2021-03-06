import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import LoadingWheel from '../../components/LoadingWheel';
import { renderLog } from '../../utils/logging';
import VoterPositionItem from '../../components/VoterGuide/VoterPositionItem';

export default class GuidePositionListForVoter extends Component {
  static propTypes = {
    voter: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = { voter: this.props.voter };
  }

  componentWillReceiveProps (nextProps) {
    // When a new candidate is passed in, update this component to show the new data
    this.setState({ voter: nextProps.voter });
  }

  render () {
    renderLog(__filename);
    if (!this.state.voter) {
      return <div>{LoadingWheel}</div>;
    }

    const { position_list_for_one_election: positionListForOneElection,
      position_list_for_all_except_one_election: positionListForAllExceptOneElection } = this.state.voter;
    return (
      <span>
        <Helmet title="Your Voter Guide - We Vote" />
        <div className="card">
          <ul className="list-group">
            { positionListForOneElection ?
              positionListForOneElection.map(item => (
                <VoterPositionItem
                  key={item.position_we_vote_id}
                  externalUniqueId={`guidePositionListForVoter-oneElection-${item.position_we_vote_id}`}
                  position={item}
                  organization={this.state.organization}
                  popover_off
                />
              )) :
              <div>{LoadingWheel}</div>
            }
            { positionListForAllExceptOneElection ? (
              <span>
                { positionListForAllExceptOneElection.length ? (
                  <span>
                    <br />
                    <h4 className="h4">Positions for Other Elections</h4>
                  </span>
                ) : null
                }
                { positionListForAllExceptOneElection.map(item => (
                  <VoterPositionItem
                    key={item.position_we_vote_id}
                    externalUniqueId={`guidePositionListForVoter-otherElections-${item.position_we_vote_id}`}
                    position={item}
                    organization={this.state.organization}
                    popover_off
                  />
                )) }
              </span>
            ) :
              <div>{LoadingWheel}</div>
            }
          </ul>
        </div>
        <br />
      </span>
    );
  }
}
