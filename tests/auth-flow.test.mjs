import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recoveryFromHash} from '../dashboard/auth-flow.js';
test('accepts recovery context only when both tokens and a bounded lifetime are present',()=>{
 const result=recoveryFromHash('#type=recovery&access_token=synthetic-access&refresh_token=synthetic-refresh&expires_in=3600',1000000);
 assert.equal(result.recovery,true);assert.equal(result.expires_at,4600);
});
test('ordinary sign-in fragments do not enter password recovery',()=>{assert.equal(recoveryFromHash('#type=signup&access_token=synthetic&refresh_token=synthetic&expires_in=3600'),null);});
test('incomplete and excessively long-lived recovery fragments are rejected',()=>{
 assert.equal(recoveryFromHash('#type=recovery&access_token=synthetic&expires_in=3600'),null);
 assert.equal(recoveryFromHash('#type=recovery&access_token=synthetic&refresh_token=synthetic&expires_in=99999999'),null);
 assert.equal(recoveryFromHash('#type=recovery&access_token=synthetic&refresh_token=synthetic&expires_in=-1'),null);
});
