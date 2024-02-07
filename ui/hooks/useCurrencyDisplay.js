import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../helpers/utils/confirm-tx.util';
import { getCurrentCurrency } from '../selectors';
import {
  getConversionRate,
  getNativeCurrency,
} from '../ducks/metamask/metamask';

import { getValueFromWeiHex } from '../../shared/modules/conversion.utils';
import { Numeric } from '../../shared/modules/Numeric';
import { TEST_NETWORK_TICKER_MAP } from 'shared/constants/network';
import { EtherDenomination } from 'shared/constants/common';

/**
 * Defines the shape of the options parameter for useCurrencyDisplay
 *
 * @typedef {object} UseCurrencyOptions
 * @property {string} [displayValue] - When present is used in lieu of formatting the inputValue
 * @property {string} [prefix] - String to prepend to the final result
 * @property {number} [numberOfDecimals] - Number of significant decimals to display
 * @property {string} [denomination] - Denomination (wei, gwei) to convert to for display
 * @property {string} [currency] - Currency type to convert to. Will override nativeCurrency
 */

/**
 * Defines the return shape of the second value in the tuple
 *
 * @typedef {object} CurrencyDisplayParts
 * @property {string} [prefix] - string to prepend to the value for display
 * @property {string} value - string representing the value, formatted for display
 * @property {string} [suffix] - string to append to the value for display
 */

/**
 * useCurrencyDisplay hook
 *
 * Given a hexadecimal encoded value string and an object of parameters used for formatting the
 * display, produce both a fully formed string and the pieces of that string used for displaying
 * the currency to the user
 *
 * @param {string} inputValue - The value to format for display
 * @param {UseCurrencyOptions} opts - An object for options to format the inputValue
 * @returns {[string, CurrencyDisplayParts]}
 */
export function useCurrencyDisplay(
  inputValue,
  { displayValue, prefix, numberOfDecimals, denomination, currency, ...opts },
) {
  const currentCurrency = useSelector(getCurrentCurrency);
  const nativeCurrency = useSelector(getNativeCurrency);
  const conversionRate = useSelector(getConversionRate);
  const isUserPreferredCurrency = currency === currentCurrency;

  const value = useMemo(() => {
    let ethDisplayValue;
    if (displayValue) {
      return displayValue;
    }
    if (
      currency === nativeCurrency ||
      (!isUserPreferredCurrency && !nativeCurrency)
    ) {
      ethDisplayValue = new Numeric(inputValue, 16, EtherDenomination.WEI)
        .toDenomination(denomination || EtherDenomination.ETH)
        .round(numberOfDecimals || 6)
        .toBase(10)
        .toString();

      if (ethDisplayValue === '0' && inputValue && Number(inputValue) !== 0) {
        ethDisplayValue = '<0.000001';
      }

      return ethDisplayValue;
    } else if (isUserPreferredCurrency && conversionRate) {
      return formatCurrency(
        getValueFromWeiHex({
          value: inputValue,
          fromCurrency: nativeCurrency,
          toCurrency: currency,
          conversionRate,
          numberOfDecimals: numberOfDecimals || 2,
          toDenomination: denomination,
        }),
        currency,
      );
    }
    return null;
  }, [
    inputValue,
    nativeCurrency,
    conversionRate,
    displayValue,
    numberOfDecimals,
    denomination,
    currency,
    isUserPreferredCurrency,
  ]);

  let suffix;

  if (!opts.hideLabel) {
    // if the currency we are displaying is the native currency of one of our preloaded test-nets (goerli, sepolia etc.)
    // then we allow lowercase characters, otherwise we force to uppercase any suffix passed as a currency
    const currencyTickerSymbol = Object.values(
      TEST_NETWORK_TICKER_MAP,
    ).includes(currency)
      ? currency
      : currency?.toUpperCase();

    suffix = opts.suffix || currencyTickerSymbol;
  }

  return [
    `${prefix || ''}${value}${suffix ? ` ${suffix}` : ''}`,
    { prefix, value, suffix },
  ];
}
