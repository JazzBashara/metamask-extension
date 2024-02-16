import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  AlignItems,
  BackgroundColor,
  BorderColor,
  BorderRadius,
  Color,
  Display,
  JustifyContent,
  Size,
} from '../../../helpers/constants/design-system';
import {
  AvatarAccount,
  AvatarAccountVariant,
  BadgeWrapper,
  Box,
} from '../../component-library';
import {
  getAddressConnectedSubjectMap,
  getOrderedConnectedAccountsForActiveTab,
  getOriginOfCurrentTab,
  getPermissionsForActiveTab,
  getUseBlockie,
} from '../../../selectors';
import Tooltip from '../../ui/tooltip';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/snaps-rpc-methods';
import {
  STATUS_CONNECTED,
  STATUS_CONNECTED_TO_ANOTHER_ACCOUNT,
  STATUS_CONNECTED_TO_SNAP,
  STATUS_NOT_CONNECTED,
} from '../../../helpers/constants/connected-sites';
import { findKey } from 'lodash';

export const BadgeStatus = ({ className = '', address, text }) => {
  const useBlockie = useSelector(getUseBlockie);
  const permissionsForActiveTab = useSelector(getPermissionsForActiveTab);
  const connectedAccounts = useSelector(
    getOrderedConnectedAccountsForActiveTab,
  );

  const activeWalletSnap = permissionsForActiveTab
    .map((permission) => permission.key)
    .includes(WALLET_SNAP_PERMISSION_KEY);

  const addressConnectedSubjectMap = useSelector(getAddressConnectedSubjectMap);
  const originOfCurrentTab = useSelector(getOriginOfCurrentTab);

  const selectedAddressSubjectMap = addressConnectedSubjectMap[address];
  const currentTabIsConnectedToSelectedAddress = Boolean(
    selectedAddressSubjectMap && selectedAddressSubjectMap[originOfCurrentTab],
  );
  const isConnectedAndNotActive =
    findKey(addressConnectedSubjectMap, originOfCurrentTab) === address;

let isActive = false;

for (let i = 0; i < connectedAccounts.length; i++) {
  if (connectedAccounts[i].address === address) {
    isActive = i === 0;
    break; // No need to continue searching once found
  }
}
    let status;
    if (currentTabIsConnectedToSelectedAddress) {
      status = STATUS_CONNECTED;
    } else if (isActive) {
      status = STATUS_CONNECTED_TO_ANOTHER_ACCOUNT;
    } else if (activeWalletSnap) {
      status = STATUS_CONNECTED_TO_SNAP;
    } else {
      status = STATUS_NOT_CONNECTED;
    }
    console.log(isActive);
  let badgeBorderColor = BackgroundColor.backgroundDefault;
  let badgeBackgroundColor = Color.borderMuted;
  if (status === STATUS_CONNECTED) {
    badgeBorderColor = BackgroundColor.backgroundDefault;
    badgeBackgroundColor = BackgroundColor.successDefault;
  } else if (
    status === STATUS_CONNECTED_TO_ANOTHER_ACCOUNT ||
    status === STATUS_CONNECTED_TO_SNAP
  ) {
    badgeBorderColor = BorderColor.successDefault;
    badgeBackgroundColor = BackgroundColor.backgroundDefault;
  }

  return (
    <Box
      className={classNames('multichain-badge-status', className)}
      data-testid="multichain-badge-status"
      as="button"
      display={Display.Flex}
      alignItems={AlignItems.center}
      justifyContent={JustifyContent.center}
      backgroundColor={BackgroundColor.backgroundDefault}
    >
      <Tooltip
        title={text}
        data-testid="multichain-badge-status__tooltip"
        position="bottom"
      >
        <BadgeWrapper
          positionObj={
            isConnectedAndNotActive
              ? { bottom: 2, right: 5, zIndex: 1 }
              : { bottom: -1, right: 2, zIndex: 1 }
          }
          badge={
            <Box
              className={classNames('multichain-badge-status__badge', {
                'not-connected': isConnectedAndNotActive,
              })}
              backgroundColor={badgeBackgroundColor}
              borderRadius={BorderRadius.full}
              borderColor={badgeBorderColor}
              borderWidth={isConnectedAndNotActive ? 2 : 4}
            />
          }
        >
          <AvatarAccount
            borderColor={BorderColor.transparent}
            size={Size.MD}
            address={address}
            variant={
              useBlockie
                ? AvatarAccountVariant.Blockies
                : AvatarAccountVariant.Jazzicon
            }
            marginInlineEnd={2}
          />
        </BadgeWrapper>
      </Tooltip>
    </Box>
  );
};

BadgeStatus.propTypes = {
  /**
   * Additional classNames to be added to the BadgeStatus
   */
  className: PropTypes.string,
  /**
   * Connection status message on Tooltip
   */
  text: PropTypes.string,
  /**
   * Address for AvatarAccount
   */
  address: PropTypes.string.isRequired,
};
