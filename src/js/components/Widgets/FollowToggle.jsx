import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CheckCircle from '@material-ui/icons/CheckCircle';
import NotInterested from '@material-ui/icons/NotInterested';
import { historyPush } from '../../utils/cordovaUtils';
import VoterGuideStore from '../../stores/VoterGuideStore';
import { renderLog } from '../../utils/logging';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import VoterStore from '../../stores/VoterStore';
import { openSnackbar } from './SnackNotifier';

export default class FollowToggle extends Component {
  static propTypes = {
    currentBallotIdInUrl: PropTypes.string,
    handleIgnore: PropTypes.func,
    hideStopFollowingButton: PropTypes.bool,
    hideStopIgnoringButton: PropTypes.bool,
    ballotItemWeVoteId: PropTypes.string,
    showFollowingText: PropTypes.bool,
    urlWithoutHash: PropTypes.string,
    organizationWeVoteId: PropTypes.string,
    hideDropdownButtonUntilFollowing: PropTypes.bool,
    lightModeOn: PropTypes.bool,
    anchorLeft: PropTypes.bool,
  };

  constructor (props) {
    super(props);
    this.state = {
      componentDidMountFinished: false,
      isFollowing: false,
      isIgnoring: false,
      organization: {},
      voter: {
        we_vote_id: '',
      },
    };

    this.followInstantly = this.followInstantly.bind(this);
    this.handleIgnoreLocal = this.handleIgnoreLocal.bind(this);
    this.stopFollowingInstantly = this.stopFollowingInstantly.bind(this);
    this.stopIgnoringInstantly = this.stopIgnoringInstantly.bind(this);
  }

  componentDidMount () {
    // console.log('componentDidMount, this.props: ', this.props);
    if (this.props.organizationWeVoteId) {
      this.setState({
        componentDidMountFinished: true,
        isFollowing: OrganizationStore.isVoterFollowingThisOrganization(this.props.organizationWeVoteId),
        isIgnoring: OrganizationStore.isVoterIgnoringThisOrganization(this.props.organizationWeVoteId),
        organization: OrganizationStore.getOrganizationByWeVoteId(this.props.organizationWeVoteId),
        organizationWeVoteId: this.props.organizationWeVoteId,
      });
    }
    this.onVoterStoreChange();

    // We need the voterGuideStoreListener until we take the follow functions out of OrganizationActions and VoterGuideStore
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentWillReceiveProps (nextProps) {
    // console.log('itemActionBar, RELOAD componentWillReceiveProps');
    if (nextProps.organizationWeVoteId !== undefined && nextProps.organizationWeVoteId && nextProps.organizationWeVoteId !== this.state.organizationWeVoteId) {
      this.setState({
        componentDidMountFinished: true,
        isFollowing: OrganizationStore.isVoterFollowingThisOrganization(nextProps.organizationWeVoteId),
        isIgnoring: OrganizationStore.isVoterIgnoringThisOrganization(nextProps.organizationWeVoteId),
        organization: OrganizationStore.getOrganizationByWeVoteId(nextProps.organizationWeVoteId),
        organizationWeVoteId: nextProps.organizationWeVoteId,
      });
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.state.componentDidMountFinished === false) {
      // console.log('shouldComponentUpdate: componentDidMountFinished === false');
      return true;
    }

    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('shouldComponentUpdate: this.state.organizationWeVoteId', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId', nextState.organizationWeVoteId);
      return true;
    }

    if (this.state.isFollowing !== nextState.isFollowing) {
      // console.log('shouldComponentUpdate: this.state.isFollowing', this.state.isFollowing, ', nextState.isFollowing', nextState.isFollowing);
      return true;
    }

    if (this.state.isIgnoring !== nextState.isIgnoring) {
      // console.log('shouldComponentUpdate: this.state.isIgnoring', this.state.isIgnoring, ', nextState.isIgnoring', nextState.isIgnoring);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    // console.log('componentWillUnmount, this.state.organizationWeVoteId: ', this.state.organizationWeVoteId);
    this.voterGuideStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
  }

  onVoterGuideStoreChange () {
    // console.log('FollowToggle, onVoterGuideStoreChange, organization_we_vote_id: ', this.state.organizationWeVoteId);
    if (this.state.organizationWeVoteId) {
      const { organizationWeVoteId } = this.state;
      this.setState({
        isFollowing: OrganizationStore.isVoterFollowingThisOrganization(organizationWeVoteId),
        isIgnoring: OrganizationStore.isVoterIgnoringThisOrganization(organizationWeVoteId),
        organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
      });
    }
  }

  onOrganizationStoreChange () {
    // console.log('FollowToggle, onOrganizationStoreChange, organization_we_vote_id: ', this.state.organizationWeVoteId);
    if (this.state.organizationWeVoteId) {
      const { organizationWeVoteId } = this.state;
      this.setState({
        isFollowing: OrganizationStore.isVoterFollowingThisOrganization(organizationWeVoteId),
        isIgnoring: OrganizationStore.isVoterIgnoringThisOrganization(organizationWeVoteId),
        organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
      });
    }
  }

  onVoterStoreChange () {
    this.setState({ voter: VoterStore.getVoter() });
  }

  startFollowingLocalState () {
    this.setState({
      isFollowing: true,
      isIgnoring: false,
    });
  }

  startIgnoringLocalState () {
    this.setState({
      isFollowing: false,
      isIgnoring: true,
    });
  }

  stopFollowingLocalState () {
    this.setState({
      isFollowing: false,
      isIgnoring: false,
    });
  }

  stopIgnoringLocalState () {
    this.setState({
      isFollowing: false,
      isIgnoring: false,
    });
  }

  stopFollowingInstantly (stopFollowingFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId) {
    if (currentBallotIdInUrl && urlWithoutHash && urlWithoutHash) {
      if (currentBallotIdInUrl !== ballotItemWeVoteId) {
        historyPush(`${this.props.urlWithoutHash}#${this.props.ballotItemWeVoteId}`);
      }
    }

    let toastMessage = "You've stopped following this organization's opinions.";

    if (this.state.organization && this.state.organization.organization_name) {
      const organizationName = this.state.organization.organization_name;
      toastMessage = `You've stopped following ${organizationName}'s opinions!`;
    }

    stopFollowingFunc();
    openSnackbar({ message: toastMessage });
    this.stopFollowingLocalState();
  }

  stopIgnoringInstantly (stopIgnoringFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId) {
    if (currentBallotIdInUrl && urlWithoutHash && urlWithoutHash) {
      if (currentBallotIdInUrl !== ballotItemWeVoteId) {
        historyPush(`${this.props.urlWithoutHash}#${this.props.ballotItemWeVoteId}`);
      }
    }

    let toastMessage = "You've stopped ignoring this organization's opinions.";

    if (this.state.organization && this.state.organization.organization_name) {
      const organizationName = this.state.organization.organization_name;
      toastMessage = `You've stopped ignoring ${organizationName}'s opinions!`;
    }

    stopIgnoringFunc();
    openSnackbar({ message: toastMessage });
    this.stopIgnoringLocalState();
  }

  followInstantly (followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId) {
    if (currentBallotIdInUrl && urlWithoutHash && urlWithoutHash) {
      if (currentBallotIdInUrl !== ballotItemWeVoteId) {
        historyPush(`${this.props.urlWithoutHash}#${this.props.ballotItemWeVoteId}`);
      }
    }

    let toastMessage = "Now following this organization's opinions!";

    if (this.state.organization && this.state.organization.organization_name) {
      const organizationName = this.state.organization.organization_name;
      toastMessage = `Now following ${organizationName}'s opinions!`;
    }

    followFunction();
    openSnackbar({ message: toastMessage });
    this.startFollowingLocalState();
  }

  handleIgnoreLocal () {
    // Some parent components need to react with this organization is ignored
    if (this.props.handleIgnore) {
      this.props.handleIgnore();
    }
  }

  ignoreInstantly (ignoreFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId) {
    if (currentBallotIdInUrl && urlWithoutHash && urlWithoutHash) {
      if (currentBallotIdInUrl !== ballotItemWeVoteId) {
        historyPush(`${this.props.urlWithoutHash}#${this.props.ballotItemWeVoteId}`);
      }
    }

    let toastMessage = "Now ignoring this organization's opinions.";

    if (this.state.organization && this.state.organization.organization_name) {
      const organizationName = this.state.organization.organization_name;
      toastMessage = `Now ignoring ${organizationName}'s opinions.`;
    }

    ignoreFunction();
    this.handleIgnoreLocal();
    openSnackbar({ message: toastMessage });
    this.startIgnoringLocalState();
  }

  render () {
    renderLog(__filename);
    if (!this.state || !this.state.organizationWeVoteId) { return <div />; }

    const { isFollowing, isIgnoring, organizationWeVoteId } = this.state;
    const isLookingAtSelf = this.state.voter.linked_organization_we_vote_id === organizationWeVoteId;
    // console.log('FollowToggle render, isFollowing: ', isFollowing, ', isIgnoring: ', isIgnoring);

    // You should not be able to follow yourself
    if (isLookingAtSelf) { return <div />; }

    const { currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId, showFollowingText } = this.props;
    const followFunction = OrganizationActions.organizationFollow.bind(this, organizationWeVoteId);
    const ignoreFunction = OrganizationActions.organizationFollowIgnore.bind(this, organizationWeVoteId);
    const stopFollowingFunc = OrganizationActions.organizationStopFollowing.bind(this, organizationWeVoteId);
    const stopIgnoringFunc = OrganizationActions.organizationStopIgnoring.bind(this, organizationWeVoteId);

    return (
      <div className="issues-follow-container">
        {isFollowing || isIgnoring ? (
          <Button type="button" className="issues-follow-btn issues-follow-btn__main issues-follow-btn__icon issues-follow-btn--white issues-followed-btn--disabled" disabled>
            {showFollowingText ? (
              <span>
                { isFollowing && (
                  <span>
                    <CheckCircle className="following-icon" />
                    <span className="pl-2">Following</span>
                  </span>
                )}
                { isIgnoring && (
                  <span>
                    <NotInterested className="ignoring-icon" />
                    <span className="pl-2">Ignoring</span>
                  </span>
                )}
              </span>
            ) : (
              <span>
                { isFollowing &&
                  <CheckCircle className="following-icon" /> }
                { isIgnoring &&
                  <NotInterested className="ignoring-icon" /> }
              </span>
            )}
          </Button>
        ) : (
          <>
            {this.props.hideDropdownButtonUntilFollowing ? (
              <>
                {this.props.lightModeOn ? (
                  <Button id={`positionItemFollowToggleFollow-${organizationWeVoteId}`} type="button" className="dropdown-toggle dropdown-toggle-split issues-follow-btn issues-follow-btn__main issues-follow-btn__main--radius issues-follow-btn--white" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Follow
                  </Button>
                ) : (
                  <Button id={`positionItemFollowToggleFollow-${organizationWeVoteId}`} type="button" className="dropdown-toggle dropdown-toggle-split issues-follow-btn issues-follow-btn__main issues-follow-btn__main--radius issues-follow-btn--blue" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Follow
                  </Button>
                )}
                <div className={this.props.anchorLeft ? (
                  'dropdown-menu dropdown-menu-left issues-follow-btn__menu'
                ) : (
                  'dropdown-menu dropdown-menu-right issues-follow-btn__menu'
                )}
                >
                  {isFollowing ? (
                    <span className="d-print-none">
                      { this.props.hideStopFollowingButton ?
                        null : (
                          <Button id={`positionItemFollowToggleUnfollow-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopFollowingInstantly(stopFollowingFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Unfollow
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button id={`positionItemFollowToggleFollowDropdown-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.followInstantly(followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                      Follow
                    </Button>
                  )}
                  <div className="dropdown-divider" />
                  {isIgnoring ? (
                    <span className="d-print-none">
                      { this.props.hideStopIgnoringButton ?
                        null : (
                          <Button id={`positionItemFollowToggleStopIgnoring-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopIgnoringInstantly(stopIgnoringFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Stop Ignoring
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button
                      id={`positionItemFollowToggleIgnore-${organizationWeVoteId}`}
                      type="button"
                      className="dropdown-item issues-follow-btn issues-follow-btn__menu-item"
                      onClick={() => this.ignoreInstantly(ignoreFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}
                    >
                      Ignore
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                {this.props.lightModeOn ? (
                  <Button id={`positionItemFollowToggleFollow-${organizationWeVoteId}`} type="button" className="issues-follow-btn issues-follow-btn__main issues-follow-btn--white" onClick={() => this.followInstantly(followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                    Follow
                  </Button>
                ) : (
                  <Button id={`positionItemFollowToggleFollow-${organizationWeVoteId}`} type="button" className="issues-follow-btn issues-follow-btn__main issues-follow-btn--blue" onClick={() => this.followInstantly(followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                    Follow
                  </Button>
                )}
              </>
            )}
          </>
        )}
        {this.props.hideDropdownButtonUntilFollowing ? (
          <>
            {isFollowing || isIgnoring ? (
              <>
                <div className="issues-follow-btn__seperator" />
                <Button id={`positionItemFollowToggleDropdown-${organizationWeVoteId}`} type="button" className="dropdown-toggle dropdown-toggle-split issues-follow-btn issues-follow-btn__dropdown issues-follow-btn--white" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="sr-only">Toggle Dropdown</span>
                </Button>
                <div className={this.props.anchorLeft ? (
                  'dropdown-menu dropdown-menu-left issues-follow-btn__menu'
                ) : (
                  'dropdown-menu dropdown-menu-right issues-follow-btn__menu'
                )}
                >
                  {isFollowing ? (
                    <span className="d-print-none">
                      { this.props.hideStopFollowingButton ?
                        null : (
                          <Button id={`positionItemFollowToggleUnfollow-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopFollowingInstantly(stopFollowingFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Unfollow
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button id={`positionItemFollowToggleFollowDropDown-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.followInstantly(followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                      Follow
                    </Button>
                  )}
                  <div className="dropdown-divider" />
                  {isIgnoring ? (
                    <span className="d-print-none">
                      { this.props.hideStopIgnoringButton ?
                        null : (
                          <Button id={`positionItemFollowToggleStopIgnoring-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopIgnoringInstantly(stopIgnoringFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Stop Ignoring
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button
                      id={`positionItemFollowToggleIgnore-${organizationWeVoteId}`}
                      type="button"
                      className="dropdown-item issues-follow-btn issues-follow-btn__menu-item"
                      onClick={() => this.ignoreInstantly(ignoreFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}
                    >
                      Ignore
                    </Button>
                  )}
                </div>
              </>
            ) : (
              null
            )}
          </>
        ) : (
          <>
            {isFollowing || isIgnoring ? (
              <>
                <div className="issues-follow-btn__seperator" />
                <Button id={`positionItemFollowToggleDropDown-${organizationWeVoteId}`} type="button" className="dropdown-toggle dropdown-toggle-split issues-follow-btn issues-follow-btn__dropdown issues-follow-btn--white" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="sr-only">Toggle Dropdown</span>
                </Button>
                <div className="dropdown-menu issues-follow-btn__menu">
                  {isFollowing ? (
                    <span className="d-print-none">
                      { this.props.hideStopFollowingButton ?
                        null : (
                          <Button id={`positionItemFollowToggleUnfollow-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopFollowingInstantly(stopFollowingFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Unfollow
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button id={`positionItemFollowToggleFollow-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.followInstantly(followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                      Follow
                    </Button>
                  )}
                  <div className="dropdown-divider" />
                  {isIgnoring ? (
                    <span className="d-print-none">
                      { this.props.hideStopIgnoringButton ?
                        null : (
                          <Button id={`positionItemFollowToggleStopIgnoring-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopIgnoringInstantly(stopIgnoringFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Stop Ignoring
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button
                      id={`positionItemFollowToggleIgnore-${organizationWeVoteId}`}
                      type="button"
                      className="dropdown-item issues-follow-btn issues-follow-btn__menu-item"
                      onClick={() => this.ignoreInstantly(ignoreFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}
                    >
                      Ignore
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="issues-follow-btn__seperator" />
                {this.props.lightModeOn ? (
                  <Button id={`positionItemFollowToggleDropdown-${organizationWeVoteId}`} type="button" className="dropdown-toggle dropdown-toggle-split issues-follow-btn issues-follow-btn__dropdown issues-follow-btn--white" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="sr-only">Toggle Dropdown</span>
                  </Button>
                ) : (
                  <Button id={`positionItemFollowToggleDropdown-${organizationWeVoteId}`} type="button" className="dropdown-toggle dropdown-toggle-split issues-follow-btn issues-follow-btn__dropdown issues-follow-btn--blue" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="sr-only">Toggle Dropdown</span>
                  </Button>
                )}
                <div className={this.props.anchorLeft ? (
                  'dropdown-menu dropdown-menu-left issues-follow-btn__menu'
                ) : (
                  'dropdown-menu dropdown-menu-right issues-follow-btn__menu'
                )}
                >
                  {isFollowing ? (
                    <span className="d-print-none">
                      { this.props.hideStopFollowingButton ?
                        null : (
                          <Button id={`positionItemFollowToggleUnfollow-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopFollowingInstantly(stopFollowingFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Unfollow
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button id={`positionItemFollowToggleFollow-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.followInstantly(followFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                      Follow
                    </Button>
                  )}
                  <div className="dropdown-divider" />
                  {isIgnoring ? (
                    <span className="d-print-none">
                      { this.props.hideStopIgnoringButton ?
                        null : (
                          <Button id={`positionItemFollowToggleStopIgnoring-${organizationWeVoteId}`} type="button" className="dropdown-item issues-follow-btn issues-follow-btn__menu-item" onClick={() => this.stopIgnoringInstantly(stopIgnoringFunc, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}>
                            Stop Ignoring
                          </Button>
                        )}
                    </span>
                  ) : (
                    <Button
                      id={`positionItemFollowToggleIgnore-${organizationWeVoteId}`}
                      type="button"
                      className="dropdown-item issues-follow-btn issues-follow-btn__menu-item"
                      onClick={() => this.ignoreInstantly(ignoreFunction, currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId)}
                    >
                      Ignore
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
