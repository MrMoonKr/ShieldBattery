import React from 'react'
import { CHANNEL_MAXLENGTH, CHANNEL_PATTERN } from '../../common/constants'
import { closeDialog } from '../dialogs/action-creators'
import { DialogType } from '../dialogs/dialog-type'
import { useForm } from '../forms/form-hook'
import { composeValidators, maxLength, regex, required } from '../forms/validators'
import { useAutoFocusRef } from '../material/auto-focus'
import { TextButton } from '../material/button'
import { Dialog } from '../material/dialog'
import { TextField } from '../material/text-field'
import { useAppDispatch } from '../redux-hooks'
import { useStableCallback } from '../state-hooks'
import { joinChannel } from './action-creators'

const channelValidator = composeValidators(
  required('Enter a channel name'),
  maxLength(CHANNEL_MAXLENGTH, `Enter at most ${CHANNEL_MAXLENGTH} characters`),
  regex(CHANNEL_PATTERN, 'Channel name contains invalid characters'),
)

interface JoinChannelModel {
  channel: string
}

export function JoinChannelDialog({
  dialogRef,
  onCancel,
}: {
  dialogRef: React.Ref<HTMLDivElement>
  onCancel: () => void
}) {
  const dispatch = useAppDispatch()
  const autoFocusRef = useAutoFocusRef<HTMLInputElement>()

  const onFormSubmit = useStableCallback((model: JoinChannelModel) => {
    const channelName = model.channel

    dispatch(
      joinChannel(channelName, {
        onSuccess: () => dispatch(closeDialog(DialogType.ChannelJoin)),
        onError: () => dispatch(closeDialog(DialogType.ChannelJoin)),
      }),
    )
  })

  const { onSubmit: handleSubmit, bindInput } = useForm<JoinChannelModel>(
    { channel: '' },
    { channel: value => channelValidator(value) },
    { onSubmit: onFormSubmit },
  )

  const buttons = [
    <TextButton label='Cancel' key='cancel' color='accent' onClick={onCancel} />,
    <TextButton label='Join' key='join' color='accent' onClick={handleSubmit} />,
  ]

  return (
    <Dialog title='Join channel' buttons={buttons} onCancel={onCancel} dialogRef={dialogRef}>
      <form noValidate={true} onSubmit={handleSubmit}>
        <TextField
          {...bindInput('channel')}
          label='Channel name'
          floatingLabel={true}
          ref={autoFocusRef}
          inputProps={{
            autoCapitalize: 'off',
            autoCorrect: 'off',
            spellCheck: false,
            tabIndex: 0,
          }}
        />
      </form>
    </Dialog>
  )
}
