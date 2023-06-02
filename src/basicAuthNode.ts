import { Nodes, ProcessStatus, utils } from '@flowbuild/engine';
import { merge } from 'lodash';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
require('dotenv').config();

class BasicAuthNode extends Nodes.SystemTaskNode {
  [x: string]: any;
  constructor(schema: any) {
    super(schema);
  }
  static get schema() {
    return merge(super.schema, {
      type: 'object',
      properties: {
        next: { type: 'string' },
        parameters: {
          type: 'object',
          properties: {
            request: {
              type: 'object',
              required: ['verb', 'baseUrl', 'route', 'auth'],
              properties: {
                verb: { type: 'string' },
                baseUrl: {
                  oneOf: [{ type: 'string' }, { type: 'object' }],
                },
                route: {
                  oneOf: [{ type: 'string' }, { type: 'object' }],
                },
                auth: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: {
                      oneOf: [{ type: 'string' }, { type: 'object' }],
                    },
                    password: {
                      oneOf: [{ type: 'string' }, { type: 'object' }],
                    },
                  },
                },
                headers: { type: 'object' },
              },
            },
          },
        },
      },
    });
  }

  static validate(spec: any) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(BasicAuthNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return BasicAuthNode.validate(this._spec);
  }

  async _run(executionData: any) {
    const maxContentLength = parseInt(
      process.env.MAX_CONTENT_LENGTH || '20000',
      10,
    );
    const maxBodyLength = parseInt(process.env.MAX_BODY_LENGTH || '20000', 10);
    const timeout = parseInt(process.env.TIMEOUT || '30000', 10);
    const { verb, baseUrl, route, auth, headers } = this.request;
    const requestConfig: AxiosRequestConfig = {
      method: verb,
      url: route,
      baseURL: baseUrl,
      auth,
      headers,
      data: executionData,
      maxContentLength,
      maxBodyLength,
      timeout,
    };
    const result: AxiosResponse = await axios(requestConfig);
    console.log('chegou aqui lib nodes basic auth node');
    return [
      { status: result.status, data: result.data },
      ProcessStatus.RUNNING,
    ];
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    this.request = utils.prepare(this._spec.parameters.request, {
      bag,
      result: input,
      actor_data,
      environment,
      parameters,
    });
    return super._preProcessing({
      bag,
      input,
      actor_data,
      environment,
      parameters,
    });
  }
}

export default BasicAuthNode;
