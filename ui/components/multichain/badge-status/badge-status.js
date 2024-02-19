import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/snaps-rpc-methods';
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
  getOriginOfCurrentTab,
  getPermissionsForActiveTab,
  getUseBlockie,
} from '../../../selectors';
import Tooltip from '../../ui/tooltip';
import {
  STATUS_CONNECTED,
  STATUS_CONNECTED_TO_ANOTHER_ACCOUNT,
  STATUS_CONNECTED_TO_SNAP,
  STATUS_NOT_CONNECTED,
} from '../../../helpers/constants/connected-sites';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const BadgeStatus = ({ className = '', address, isActive = false }) => {
  const t = useSelector(useI18nContext);
  const useBlockie = useSelector(getUseBlockie);
  const permissionsForActiveTab = useSelector(getPermissionsForActiveTab);

  const activeWalletSnap = permissionsForActiveTab
    .map((permission) => permission.key)
    .includes(WALLET_SNAP_PERMISSION_KEY);

  const addressConnectedSubjectMap = useSelector(getAddressConnectedSubjectMap);
  const originOfCurrentTab = useSelector(getOriginOfCurrentTab);

  const selectedAddressSubjectMap = addressConnectedSubjectMap[address];
  const currentTabIsConnectedToSelectedAddress = Boolean(
    selectedAddressSubjectMap && selectedAddressSubjectMap[originOfCurrentTab],
  );

  let status;
  if (isActive) {
    status = STATUS_CONNECTED;
  } else if (currentTabIsConnectedToSelectedAddress) {
    status = STATUS_CONNECTED_TO_ANOTHER_ACCOUNT;
  } else if (activeWalletSnap) {
    status = STATUS_CONNECTED_TO_SNAP;
  } else {
    status = STATUS_NOT_CONNECTED;
  }

  let badgeBorderColor = BackgroundColor.backgroundDefault;
  let badgeBackgroundColor = Color.borderMuted;
  let tooltipText = t('statusNotConnected');
  if (status === STATUS_CONNECTED) {
    badgeBorderColor = BackgroundColor.backgroundDefault;
    badgeBackgroundColor = BackgroundColor.successDefault;
    tooltipText = t('active');
  } else if (status === STATUS_CONNECTED_TO_ANOTHER_ACCOUNT) {
    badgeBorderColor = BorderColor.successDefault;
    badgeBackgroundColor = BackgroundColor.backgroundDefault;
    tooltipText = t('tooltipSatusConnectedUpperCase');
  }

  const connectedAndNotActive =
    currentTabIsConnectedToSelectedAddress && !isActive;

  return (
    <Box
      className={classNames('multichain-badge-status', className)}
      data-testid="multichain-badge-status"
      as="button"
      display={Display.Flex}
      alignItems={AlignItems.center}
      justifyContent={JustifyContent.center}
      backgroundColor={BackgroundColor.transparent}
    >
      <Tooltip
        title={tooltipText}
        data-testid="multichain-badge-status__tooltip"
        position="bottom"
      >
        <BadgeWrapper
          positionObj={
            connectedAndNotActive
              ? { bottom: 2, right: 5, zIndex: 1 }
              : { bottom: -1, right: 2, zIndex: 1 }
          }
          badge={
            <Box
              className={classNames('multichain-badge-status__badge', {
                'not-connected': connectedAndNotActive,
              })}
              backgroundColor={badgeBackgroundColor}
              borderRadius={BorderRadius.full}
              borderColor={badgeBorderColor}
              borderWidth={connectedAndNotActive ? 2 : 4}
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
   * Address for AvatarAccount
   */
  address: PropTypes.string.isRequired,
  /**
   * Boolean to determine active status
   */
  address: PropTypes.bool,
};
