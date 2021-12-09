/*
    Copyright 2020 Set Labs Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    SPDX-License-Identifier: Apache License, Version 2.0
*/
pragma solidity 0.6.10;
pragma experimental ABIEncoderV2;

import { ISetToken } from "./ISetToken.sol";
import { INAVIssuanceHook } from "./INAVIssuanceHook.sol";
import { ISetValuer } from "./ISetValuer.sol";

interface ICustomOracleNavIssuanceModule {
    struct NAVIssuanceSettings {
        INAVIssuanceHook managerIssuanceHook;          // Issuance hook configurations
        INAVIssuanceHook managerRedemptionHook;        // Redemption hook configurations
        ISetValuer setValuer;                          // Optional custom set valuer. If address(0) is provided, fetch the default one from the controller
        address[] reserveAssets;                       // Allowed reserve assets - Must have a price enabled with the price oracle
        address feeRecipient;                          // Manager fee recipient
        uint256[2] managerFees;                        // Manager fees. 0 index is issue and 1 index is redeem fee (0.01% = 1e14, 1% = 1e16)
        uint256 maxManagerFee;                         // Maximum fee manager is allowed to set for issue and redeem
        uint256 premiumPercentage;                     // Premium percentage (0.01% = 1e14, 1% = 1e16). This premium is a buffer around oracle
        // prices paid by user to the SetToken, which prevents arbitrage and oracle front running
        uint256 maxPremiumPercentage;                  // Maximum premium percentage manager is allowed to set (configured by manager)
        uint256 minSetTokenSupply;                     // Minimum SetToken supply required for issuance and redemption
        // to prevent dramatic inflationary changes to the SetToken's position multiplier
    }

    function issue(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _reserveAssetQuantity,
        uint256 _minSetTokenReceiveQuantity,
        address _to
    )
    external;

    function issueWithEther(
        ISetToken _setToken,
        uint256 _minSetTokenReceiveQuantity,
        address _to
    )
    external;

    function redeem(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _setTokenQuantity,
        uint256 _minReserveReceiveQuantity,
        address _to
    )
    external;

    function redeemIntoEther(
        ISetToken _setToken,
        uint256 _setTokenQuantity,
        uint256 _minReserveReceiveQuantity,
        address payable _to
    )
    external;

    function addReserveAsset(
        ISetToken _setToken,
        address _reserveAsset
    )
    external;

    function removeReserveAsset(ISetToken _setToken, address _reserveAsset) external;

    function editPremium(ISetToken _setToken, uint256 _premiumPercentage) external;

    function editManagerFee(
        ISetToken _setToken,
        uint256 _managerFeePercentage,
        uint256 _managerFeeIndex
    )
    external;

    function editFeeRecipient(ISetToken _setToken, address _managerFeeRecipient) external;

    function initialize(
        ISetToken _setToken,
        NAVIssuanceSettings memory _navIssuanceSettings
    )
    external;

    function getReserveAssets(ISetToken _setToken) external view returns (address[] memory);

    function getIssuePremium(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _reserveAssetQuantity
    )
    external
    view
    returns (uint256);

    function getRedeemPremium(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _setTokenQuantity
    )
    external
    view
    returns (uint256);

    function getManagerFee(ISetToken _setToken, uint256 _managerFeeIndex) external view returns (uint256);

    function getExpectedSetTokenIssueQuantity(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _reserveAssetQuantity
    )
    external
    view
    returns (uint256);

    function getExpectedReserveRedeemQuantity(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _setTokenQuantity
    )
    external
    view
    returns (uint256);

    function isIssueValid(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _reserveAssetQuantity
    )
    external
    view
    returns (bool);

    function isRedeemValid(
        ISetToken _setToken,
        address _reserveAsset,
        uint256 _setTokenQuantity
    )
    external
    view
    returns (bool);
}