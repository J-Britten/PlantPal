<script lang="ts" setup>

const ConnectionStore = useConnectionStore()
const mail = useMail()
const { data } = useAuth()

const displayToast = inject('displayToast');
const issueDescription = ref('')
const formRef = ref(null)

const select = ref(null)
const issuetopics = ref(['The App', 'The Farming Robot', 'The Camera Stream', 'Other Users', 'Other Issues'])
const checkbox = ref(false)

async function validate() {
  const validation = await formRef.value.validate()
  if (validation.valid) {
    alert('Validation succeeded')
  }
}

function reset() {
  formRef.value.reset()
}

function resetValidation() {
  formRef.value.resetValidation()
}

async function submitIssue() {
  const validation = await formRef.value.validate()
  if (!validation.valid) return;
  try {
    await mail.send({
      from: 'Farmbot App',
      subject: 'App: New issue reported by ' + data.value?.user.name + ': ' + select.value,
      text: 'Issue reported by: ' + data.value?.user?.name + '\nIssue Type: ' + select.value + '\nIssue Description: ' + issueDescription.value,
    })

    ConnectionStore.logAction('issueReported', { issueType: select.value, issueDescription: issueDescription.value })
  } catch (error) {
    alert('Error sending email. Please try again later or contact us directly at farmbot.uulm@gmail.com')
    return;
  }
  displayToast('Issue reported successfully', 'success')
  formRef.value.reset()

}

</script>

<template>
  <v-card>
    <v-card-title><v-icon>mdi-information</v-icon></v-card-title>
    <v-card-text> Please fill out this form if you've encountered any issue while using the app.
      This helps us in our research and won't have an impact on your study participation.
      It helps us to ensure that you and the other participants have a smooth experience.
    </v-card-text></v-card>
  <v-spacer class="pt-4"></v-spacer>
  <v-form ref="formRef">
    <v-label> I've encountered an issue with</v-label>
    <v-select v-model="select" :items="issuetopics" :rules="[v => !!v || 'This field is required']"
      label="Please select an issue topic" required></v-select>
    <v-textarea v-model="issueDescription" label="Please describe the issue"
      :rules="[v => !!v || 'This field is required']" maxlength="300" counter required>

    </v-textarea>
    <v-checkbox v-model="checkbox" :rules="[v => !!v || 'You must accept to continue!']"
      label="I accept that this issue will be sent to the team for review" required></v-checkbox>

    <div class="d-flex flex-column">
      <v-btn class="" color="success" block @click="submitIssue">
        Submit
      </v-btn>
    </div>
  </v-form>
</template>

<style></style>