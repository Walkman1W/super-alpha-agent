/**
 * Web Worker for sorting agents
 * 在后台线程处理排序，避免阻塞主线程
 */

self.addEventListener('message', (e) => {
  const { agents, sortBy } = e.data
  
  try {
    let sorted = [...agents]
    
    switch (sortBy) {
      case 'ai_search_count':
        sorted.sort((a, b) => (b.ai_search_count ?? 0) - (a.ai_search_count ?? 0))
        break
      case 'popularity':
        sorted.sort((a, b) => (b.ai_search_count ?? 0) - (a.ai_search_count ?? 0))
        break
      case 'recent':
        sorted.sort((a, b) => b.id.localeCompare(a.id))
        break
      default:
        break
    }
    
    // 发送排序结果回主线程
    self.postMessage({ sorted, error: null })
  } catch (error) {
    // 发送错误信息
    self.postMessage({ sorted: null, error: error.message })
  }
})
