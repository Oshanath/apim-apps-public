/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { FC, useContext, useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Utils from 'AppData/Utils';
import { FormattedMessage } from 'react-intl';
import PolicyDropzone from './PolicyDropzone';
import type { AttachedPolicy, Policy, PolicySpec } from './Types'
import FlowArrow from './components/FlowArrow';
import ApiOperationContext from './ApiOperationContext';

interface OPProps {
    target: any;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isChoreoConnectEnabled: boolean;
    policyList: Policy[];
    isGatewayChanged: boolean;
}

const getStyles = (verb: string) => {
    const useStyles = makeStyles((theme: any) => {
        const backgroundColor = theme.custom.resourceChipColors[verb];
        return {
            customButton: {
                '&:hover': { backgroundColor },
                backgroundColor,
                width: theme.spacing(12),
                color: theme.palette.getContrastText(backgroundColor),
            },
            paperStyles: {
                border: `1px solid ${backgroundColor}`,
                borderBottom: '',
                width: '100%',
            },
            customDivider: {
                backgroundColor,
            },
            linearProgress: {
                height: '2px',
            },
            highlightSelected: {
                backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
            },
            contentNoMargin: {
                margin: theme.spacing(0),
            },
            overlayUnmarkDelete: {
                position: 'absolute',
                zIndex: theme.zIndex.operationDeleteUndo,
                right: '10%',
            },
            targetText: {
                maxWidth: 300,
                margin: '0px 20px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'inline-block',
            },
            title: {
                display: 'inline',
                margin: `0 ${theme.spacing(5)}px`,
            },
            dialogPaper: {
                width: '800px',
                maxHeight: '800px',
            },
            dialogContent: {
                overflow: 'auto',
                height: '90%',
            },
            flowSpecificPolicyAttachGrid: {
                marginTop: theme.spacing(1),
                overflowX: 'scroll'
            },
            operationSummaryGrid: {
                display: 'flex',
                alignItems: 'center',
                flexBasis: '100%',
                maxWidth: '100%',
            }
        };
    })();
    return useStyles;
}

const PoliciesExpansion: FC<OPProps> = ({ target, verb, allPolicies, isChoreoConnectEnabled, policyList, isGatewayChanged }) => {

    // Policies attached for each request, response and fault flow
    const [requestFlowPolicyList, setRequestFlowPolicyList] = useState<AttachedPolicy[]>([]);
    const [responseFlowPolicyList, setResponseFlowPolicyList] = useState<AttachedPolicy[]>([]);
    const [faultFlowPolicyList, setFaultFlowPolicyList] = useState<AttachedPolicy[]>([]);

    // Droppable policy identifier list for each request, response and fault flow
    const [requestFlowDroppablePolicyList, setRequestFlowDroppablePolicyList] = useState<string[]>([]);
    const [responseFlowDroppablePolicyList, setResponseFlowDroppablePolicyList] = useState<string[]>([]);
    const [faultFlowDroppablePolicyList, setFaultFlowDroppablePolicyList] = useState<string[]>([]);

    const classes = getStyles(verb);
    const { apiOperations } = useContext<any>(ApiOperationContext);

    useEffect(() => {
        const requestList = [];
        const responseList = [];
        const faultList = [];
        for (const policy of policyList) {
            if (policy.applicableFlows.includes('request')) {
                requestList.push(`policyCard-${policy.id}`);
            }
            if (policy.applicableFlows.includes('response')) {
                responseList.push(`policyCard-${policy.id}`);
            }
            if (policy.applicableFlows.includes('fault')) {
                faultList.push(`policyCard-${policy.id}`);
            }
        }
        setRequestFlowDroppablePolicyList(requestList);
        setResponseFlowDroppablePolicyList(responseList);
        setFaultFlowDroppablePolicyList(faultList);
    }, [policyList])

    useEffect(() => {

        let operationInAction = null;
        if (!isChoreoConnectEnabled) {
            operationInAction = apiOperations.find((op: any) =>
                op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
        } else {
            operationInAction = apiOperations.find((op: any) =>
                op.target === target);
        }

        // Populate request flow attached policy list
        const requestFlowList: AttachedPolicy[] = [];
        const requestFlow = operationInAction.operationPolicies.request;
        requestFlow.map((requestFlowAttachedPolicy: any) => {
            const { policyId, policyName, uuid } = requestFlowAttachedPolicy;
            const policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId)
                || allPolicies?.find((policy1: PolicySpec) => policy1.name === policyName);
            if (policyObj) {
                requestFlowList.push({ ...policyObj, uniqueKey: uuid });
            }
        })
        setRequestFlowPolicyList(requestFlowList);

        // Populate response flow attached policy list
        const responseFlowList: AttachedPolicy[] = [];
        const responseFlow = operationInAction.operationPolicies.response;
        responseFlow.map((responseFlowAttachedPolicy: any) => {
            const { policyId, policyName, uuid } = responseFlowAttachedPolicy;
            const policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId)
                || allPolicies?.find((policy1: PolicySpec) => policy1.name === policyName);
            if (policyObj) {
                responseFlowList.push({ ...policyObj, uniqueKey: uuid });
            }
        })
        setResponseFlowPolicyList(responseFlowList);

        if (!isChoreoConnectEnabled) {
            // Populate fault flow attached policy list
            const faultFlowList: AttachedPolicy[] = [];
            const faultFlow = operationInAction.operationPolicies.fault;
            faultFlow.map((faultFlowAttachedPolicy: any) => {
                const { policyId, policyName, uuid } = faultFlowAttachedPolicy;
                const policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId)
                    || allPolicies?.find((policy1: PolicySpec) => policy1.name === policyName);
                if (policyObj) {
                    faultFlowList.push({ ...policyObj, uniqueKey: uuid });
                }
            })
            setFaultFlowPolicyList(faultFlowList);
        }

    }, [apiOperations])

    useEffect(()=>{
        // console.log("Deletion happens.."+ isChoreoConnectEnabled);
        // setRequestFlowPolicyList([]);
        // setResponseFlowPolicyList([]);
        // setFaultFlowPolicyList([]);
    },[isGatewayChanged])


    return (
        <ExpansionPanelDetails>
            <Grid spacing={2} container direction='row' justify='flex-start' alignItems='flex-start'>
                <Grid item xs={12} md={12}>
                    <Box className={classes.flowSpecificPolicyAttachGrid}>
                        <Typography variant='subtitle2' align='left'>
                            <FormattedMessage
                                id='Apis.Details.Policies.Operation.request.flow.title'
                                defaultMessage='Request Flow'
                            />
                        </Typography>
                        <FlowArrow arrowDirection='left' />
                        <PolicyDropzone
                            policyDisplayStartDirection='left'
                            currentPolicyList={requestFlowPolicyList}
                            setCurrentPolicyList={setRequestFlowPolicyList}
                            droppablePolicyList={requestFlowDroppablePolicyList}
                            currentFlow='request'
                            target={target}
                            verb={verb}
                            allPolicies={allPolicies}
                        />
                    </Box>
                    <Box className={classes.flowSpecificPolicyAttachGrid}>
                        <Typography variant='subtitle2' align='left'>
                            <FormattedMessage
                                id='Apis.Details.Policies.Operation.response.flow.title'
                                defaultMessage='Response Flow'
                            />
                        </Typography>
                        <FlowArrow arrowDirection='right' />
                        <PolicyDropzone
                            policyDisplayStartDirection='right'
                            currentPolicyList={responseFlowPolicyList}
                            setCurrentPolicyList={setResponseFlowPolicyList}
                            droppablePolicyList={responseFlowDroppablePolicyList}
                            currentFlow='response'
                            target={target}
                            verb={verb}
                            allPolicies={allPolicies}
                        />
                    </Box>
                    {isChoreoConnectEnabled ? <></> :
                        <>
                            <Box className={classes.flowSpecificPolicyAttachGrid}>
                                <Typography variant='subtitle2' align='left'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.Operation.fault.flow.title'
                                        defaultMessage='Fault Flow'
                                    />
                                </Typography>
                                <FlowArrow arrowDirection='right' />
                                <PolicyDropzone
                                    policyDisplayStartDirection='right'
                                    currentPolicyList={faultFlowPolicyList}
                                    setCurrentPolicyList={setFaultFlowPolicyList}
                                    droppablePolicyList={faultFlowDroppablePolicyList}
                                    currentFlow='fault'
                                    target={target}
                                    verb={verb}
                                    allPolicies={allPolicies}
                                />
                            </Box>
                        </>
                    }
                </Grid>
            </Grid>
        </ExpansionPanelDetails>
    )
}

export default PoliciesExpansion;
