import { MailDataRequired } from "@sendgrid/mail";
import sendGridMail from '@sendgrid/mail';
import config from "../config";
import { User } from "../models/user/doc";
import pubSub from "../misc/pub-sub";

export default function () {
  if (config.sendGridApiKey)
    sendGridMail.setApiKey(config.sendGridApiKey);
  else {
    console.error("send grid api key was not provided");
    process.exit(1);
  }
}

export enum MailType {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASS = 'reset_password',
  NEW_MEMBER = 'new_member'
}

const SenderMetaData = {
  Sender_Name: "© 2021 Pestras",
  Sender_Address: "Jordan",
  Sender_State: "Amman",
  Sender_City: "Al Matar",
  Sender_Zip: "25441"
}

const MailConf: { [key: string]: MailDataRequired } = {
  verify_email: {
    to: '',
    from: "noreply@pestras.com",
    asm: { groupId: 19089, groupsToDisplay: [19089] },
    templateId: "d-b3beb869b116476794daabdf6c0a06ef",
    dynamicTemplateData: {}
  },
  reset_password: {
    to: '',
    from: "noreply@pestras.com",
    asm: { groupId: 19089, groupsToDisplay: [19089] },
    templateId: "d-b3beb869b116476794daabdf6c0a06ef",
    dynamicTemplateData: {}
  },
  new_member: {
    to: '',
    from: "noreply@pestras.com",
    asm: { groupId: 19089, groupsToDisplay: [19089] },
    templateId: "d-810aea39d053431e80bf9ede0fd1149e",
    dynamicTemplateData: {}
  }
}

const routesPaths = {
  newUser: '',
  verifyEmail: '/auth/activate-email',
  resetPassword: '/auth/reset-password'
}

function getClientFullPath(mailType: MailType) {
  return mailType === MailType.NEW_MEMBER
    ? `${config.frontEndUrl}/${routesPaths.newUser}`
    : mailType === MailType.RESET_PASS
      ? `${config.frontEndUrl}/${routesPaths.resetPassword}`
      : `${config.frontEndUrl}/${routesPaths.verifyEmail}`;
}

function getMail(name: keyof typeof MailConf, to: string, data?: any): Readonly<MailDataRequired> {

  return {
    ...MailConf[name],
    to,
    dynamicTemplateData: Object.assign(
      {},
      MailConf[name].dynamicTemplateData,
      SenderMetaData,
      data || {}
    )
  };
}

async function sendMail(type: MailType, token: string, user: Partial<User>) {
  const conf = getMail(
    type,
    user.email![0],
    {
      link: `${getClientFullPath(type)}?t=${token}`,
      user
    }
  );

  try {
    await sendGridMail.send(conf);      
  } catch (error) {
    console.error(error);
  } 
}

pubSub.on("email.newUser", e => {
  sendMail(
    MailType.NEW_MEMBER,
    e.data.token,
    e.data.user
  );
});

pubSub.on("email.newEmail", e => {
  sendMail(
    MailType.VERIFY_EMAIL,
    e.data.token,
    e.data.user
  );
});

pubSub.on("email.resetPassword", e => {
  sendMail(
    MailType.RESET_PASS,
    e.data.token,
    e.data.user
  );
});