import {
  ActionIcon, Button, Group, Paper, Select, Stack, Text, Textarea, TextInput,
} from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading', label: 'Heading' },
  { value: 'code', label: 'Code' },
  { value: 'note', label: 'Note' },
];

const placeholderFor = (type) => {
  switch (type) {
    case 'heading': return 'Section heading';
    case 'code': return 'Code content';
    case 'note': return 'Note / callout text';
    default: return 'Paragraph text';
  }
};

const rowsFor = (type) => (type === 'code' ? 10 : type === 'heading' ? 1 : 4);

export default function BlogBlockEditor({ form, field }) {
  const blocks = form.getValues()[field] || [];
  const setBlocks = (next) => form.setFieldValue(field, next);

  const patchBlock = (idx, patch) => {
    const next = [...blocks];
    next[idx] = { ...next[idx], ...patch };
    setBlocks(next);
  };

  const addBlock = (type = 'paragraph', atIndex = null) => {
    const item = { type, text: '', lang: type === 'code' ? 'csharp' : null };
    const next = [...blocks];
    if (atIndex == null) next.push(item);
    else next.splice(atIndex + 1, 0, item);
    setBlocks(next);
  };

  const removeBlock = (idx) => {
    const next = [...blocks];
    next.splice(idx, 1);
    setBlocks(next);
  };

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    setBlocks(next);
  };

  return (
    <Stack gap="xs">
      {blocks.length === 0 ? (
        <Text c="dimmed" size="sm">No blocks yet. Add one below.</Text>
      ) : (
        blocks.map((block, idx) => (
          <Paper key={`${field}-${idx}`} withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                  <Select
                    data={BLOCK_TYPES}
                    value={block.type}
                    onChange={(val) => patchBlock(idx, {
                      type: val,
                      lang: val === 'code' ? (block.lang || 'csharp') : null,
                    })}
                    w={150}
                    allowDeselect={false}
                  />
                  {block.type === 'code' && (
                    <TextInput
                      placeholder="Language (e.g. csharp)"
                      value={block.lang ?? ''}
                      onChange={(e) => patchBlock(idx, { lang: e.currentTarget.value })}
                      w={180}
                    />
                  )}
                  <Text size="xs" c="dimmed" ff="monospace">#{idx + 1}</Text>
                </Group>
                <Group gap={4} wrap="nowrap">
                  <ActionIcon variant="subtle" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" onClick={() => move(idx, 1)} disabled={idx === blocks.length - 1}>
                    <IconArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" onClick={() => addBlock('paragraph', idx)}>
                    <IconPlus size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => removeBlock(idx)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
              <Textarea
                rows={rowsFor(block.type)}
                autosize={block.type !== 'code'}
                minRows={block.type === 'code' ? 10 : 2}
                styles={{
                  input: block.type === 'code'
                    ? { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }
                    : undefined,
                }}
                placeholder={placeholderFor(block.type)}
                value={block.text}
                onChange={(e) => patchBlock(idx, { text: e.currentTarget.value })}
              />
            </Stack>
          </Paper>
        ))
      )}
      <Group gap="xs">
        {BLOCK_TYPES.map((b) => (
          <Button
            key={b.value}
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={() => addBlock(b.value)}
          >
            {b.label}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}
